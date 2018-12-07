import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';

import TimeAgo from 'react-timeago';
import {reactTimeAgoFormatters} from '../locales/reactTimeAgoFormatters';

import CommentVisibilityIcon from './CommentVisibilityIcon';
import CommentRefererIcon from './CommentRefererIcon';
import {Mention, MentionsInput} from 'react-mentions';
import renderCoamMentionSuggestion from '../renderers/renderCoamMentionSuggestion';
import {shapes} from '@cimpress/react-components';

import {translate} from 'react-i18next';
import {getI18nInstance} from '../tools/i18n';
import {errorToString, performActionOnMetaEnter} from '../tools/helper';
import {fetchUserName, fetchMatchingMentions} from '../clients/mentions';

let {Spinner} = shapes;

class Comment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            editedComment: null,
            savingComment: !props.comment.createdAt && !props.comment.updatedAt,
            commentObject: props.comment,
        };
    }

    fetchUserNames() {
        if (this.state.updatedByName === undefined && this.state.commentObject.updatedBy) {
            this.fetchUserName(this.state.commentObject.updatedBy, 'updatedByName');
        }
        if (this.state.createdByName === undefined && this.state.commentObject.createdBy) {
            this.fetchUserName(this.state.commentObject.createdBy, 'createdByName');
        }
        if (this.state.jwtSubName === undefined && this.props.jwtSub) {
            this.fetchUserName(this.props.jwtSub, 'jwtSubName');
        }
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentDidMount() {
        this._ismounted = true;
        this.fetchUserNames();
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentDidUpdate() {
        this.fetchUserNames();
    }

    fetchUserName(userId, stateToUpdate) {
        fetchUserName(this.props.accessToken, userId)
            .then((responseJson) => {
                console.log(userId, responseJson);
                this.safeSetState({
                    [stateToUpdate]: responseJson.profile.name,
                });
            });
    }

    change(event, newValue, newPlainTextValue, mentions) {
        this.safeSetState({
            editedComment: newValue,
        });
    }

    completeEditing() {
        if (this.state.editedComment !== null && this.state.editedComment !== this.state.commentObject.comment) {
            this.safeSetState({
                savingComment: true,
            });

            this.props.commentsClient
                .putComment(this.props.commentUri, this.state.editedComment.trim(), this.state.commentObject.visibility)
                .then((responseJson) => {
                    this.safeSetState({
                        editedComment: null,
                        editMode: false,
                        savingComment: false,
                        commentObject: responseJson,
                    });
                })
                .catch((err) => {
                    this.safeSetState({
                        errorPut: err,
                        savingComment: false,
                    });
                });
        } else {
            this.safeSetState({
                editedComment: null,
                editMode: false,
                savingComment: false,
            });
        }
    }

    cancelEditing() {
        this.safeSetState({
            errorPut: undefined,
            editedComment: null,
            editMode: false,
        });
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderError(e, prefix) {
        if (!e) {
            return null;
        }
        return <span className={'text-danger'}>&nbsp;<i
            className={'fa fa-exclamation-triangle'}/>&nbsp;{prefix}{prefix ?
            <span>&nbsp;</span> : null}({this.tt(errorToString(e))})</span>;
    }

    renderEditMenu() {
        if (!this.props.editComments) {
            // editing disabled
            return null;
        }

        if (this.state.commentObject.createdBy !== this.props.jwtSub && this.state.commentObject.updatedBy !== this.props.jwtSub) {
            // can edit only 'own' comments
            return null;
        }


        if (this.state.editMode) {
            return (<div>
                {(this.state.editedComment !== null && this.state.editedComment !== this.state.commentObject.comment && this.state.editedComment !== '')
                    ? <div onClick={this.completeEditing.bind(this)} className={'fa fa-check mentions-ok'}/>
                    : null}
                {<div onClick={this.cancelEditing.bind(this)} className={'fa fa-times mentions-cancel'}/>}
            </div>);
        }

        return <div onClick={() => this.safeSetState({editMode: true})} className={'mentions-edit fa fa-edit'}/>;
    }

    render() {
        let editMenu;
        let readonlyTextField;
        if (this.state.savingComment === true) {
            readonlyTextField = true;
            editMenu = <div className={'mentions-edit'}><Spinner size={20}/></div>;
        } else {
            readonlyTextField = !this.state.editMode;
            editMenu = this.renderEditMenu();
        }

        const visibility = this.state.commentObject.visibility || 'internal';
        const visibilityOption = this.props.commentVisibilityLevels.find((l) => l.value === visibility);

        let commentBody = (
            <div
                onKeyDown={performActionOnMetaEnter(this.completeEditing.bind(this))}
                tabIndex="1"
                style={{position: 'relative'}}
            >
                <MentionsInput
                    className={`mentions ${readonlyTextField ? 'disabled' : ''}`}
                    value={this.state.editedComment !== null ? this.state.editedComment : this.state.commentObject.comment}
                    onChange={this.change.bind(this)}
                    displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}
                    readOnly={readonlyTextField}>
                    <Mention trigger="@" data={(search, callback) => {
                        fetchMatchingMentions(this.props.accessToken, search)
                            .then(callback);
                    }}
                    renderSuggestion={renderCoamMentionSuggestion}
                    />
                </MentionsInput>
                {this.renderError(this.state.errorPut, this.tt('unable_to_edit_comment'))}
                {editMenu}
            </div>
        );

        let commentCreator = <div className={'comment-creator'}>
            {`${this.state.createdByName || this.state.commentObject.createdBy}`}
            {this.state.commentObject.createdAt ?
                <React.Fragment>
                    <span>,&nbsp;</span>
                    <TimeAgo
                        date={this.state.commentObject.createdAt}
                        formatter={reactTimeAgoFormatters[this.props.locale]}/>
                </React.Fragment>
                : null}
            {this.state.commentObject.createdAt !== this.state.commentObject.updatedAt && this.state.commentObject.updatedAt
                ?
                <span>, {this.tt('modified')} {(this.state.commentObject.updatedBy !== this.state.commentObject.createdBy)
                    ? `${this.tt('by')} ${this.state.updatedByName || this.state.commentObject.updatedBy}`
                    : null} <TimeAgo
                    date={this.state.commentObject.updatedAt}
                    formatter={reactTimeAgoFormatters[this.props.locale]}/></span>
                : null}
            <CommentVisibilityIcon icon={visibilityOption.icon} label={visibilityOption.label}/>
            <CommentRefererIcon referer={this.state.commentObject.referer}/>
        </div>;

        let error = this.renderError(this.state.error, this.tt('unable_to_read_comment'));
        if (error) {
            return <div className={this.props.className || 'comment'}>{error}</div>;
        }

        return <div className={this.props.className || 'comment'}>
            {commentCreator}
            <div className={'comment-body'}>
                {commentBody}
            </div>
        </div>;
    }
}

Comment.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string,
    className: PropTypes.string,
    jwtSub: PropTypes.string,
    commentUri: PropTypes.string,
    comment: PropTypes.object,
    editComments: PropTypes.bool,

    commentVisibilityLevels: PropTypes.array,
    commentsClient: PropTypes.any,
};

Comment.defaultProps = {
    locale: 'eng',
};

export default translate('translations', {i18n: getI18nInstance()})(Comment);
