import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';

import CommentVisibilityIcon from './CommentVisibilityIcon';
import CommentRefererIcon from './CommentRefererIcon';
import CommentAuthorAvatar from './CommentAuthorAvatar';
import CommentAuthor from './CommentAuthor';
import CommentTime from './CommentTime';

import {Mention, MentionsInput} from 'react-mentions';
import renderCoamMentionSuggestion from '../renderers/renderCoamMentionSuggestion';
import {shapes} from '@cimpress/react-components';

import {translate} from 'react-i18next';
import {getI18nInstance} from '../tools/i18n';
import {errorToString, performActionOnMetaEnter} from '../tools/helper';
import {fetchMatchingMentions} from '../clients/mentions';

let {Spinner} = shapes;

class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            editedComment: null,
            updatingComment: !props.comment.createdAt && !props.comment.updatedAt,
            commentObject: props.comment,
        };
    }

    get canModify() {
        return this.props.editComments || this.props.deleteComments;
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentDidMount() {
        this._ismounted = true;
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    change(event, newValue, newPlainTextValue, mentions) {
        this.safeSetState({
            editedComment: newValue,
        });
    }

    completeEditing() {
        if (this.state.editedComment !== null && this.state.editedComment !== this.state.commentObject.comment) {
            this.safeSetState({
                updatingComment: true,
            });

            this.props.commentsClient
                .putComment(this.props.commentUri, this.state.editedComment.trim(), this.state.commentObject.visibility)
                .then((responseJson) => {
                    this.exitEditing();

                    this.safeSetState({
                        commentObject: responseJson,
                    });
                })
                .catch((err) => {
                    this.safeSetState({
                        errorPut: err,
                        updatingComment: false,
                    });
                });
        } else {
            this.safeSetState({
                editedComment: null,
                editMode: false,
                updatingComment: false,
            });
        }
    }

    deleteComment() {
        this.safeSetState({
            updatingComment: true,
        });

        this.props.commentsClient
            .deleteComment(this.props.commentUri)
            .then(() => {
                if (this.props.onDelete) {
                    this.props.onDelete(this.props.comment);
                }
            })
            .catch((err) => {
                this.safeSetState({
                    errorDelete: err,
                    updatingComment: false,
                });
            });
    }

    exitEditing() {
        this.safeSetState({
            updatingComment: false,
            editMode: false,
            editedComment: null,
            errorPut: null,
            errorDelete: null,
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
        if (!this.canModify) {
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
                {this.props.deleteComments
                    ? <div onClick={this.deleteComment.bind(this)} className={'fa fa-trash mentions-delete'}/>
                    : null}
                {<div onClick={this.exitEditing.bind(this)} className={'fa fa-times mentions-cancel'}/>}
            </div>);
        }

        return <div onClick={() => this.safeSetState({editMode: true})} className={'mentions-edit fa fa-edit'}/>;
    }

    render() {
        let editMenu;
        let readonlyTextField;
        if (this.state.updatingComment === true) {
            readonlyTextField = true;
            editMenu = <div className={'mentions-edit'}><Spinner size={'small'}/></div>;
        } else {
            readonlyTextField = !(this.state.editMode && this.props.editComments);
            editMenu = this.renderEditMenu();
        }

        const visibility = this.state.commentObject.visibility || 'internal';
        const visibilityOption = this.props.commentVisibilityLevels.find((l) => l.value === visibility);

        let commentBody = (
            <div
                onKeyDown={performActionOnMetaEnter(this.completeEditing.bind(this))}
                tabIndex="1"
                style={{position: 'relative', display: 'flex', flexFlow: 'row'}}>
                <MentionsInput
                    className={`mentions ${readonlyTextField ? 'disabled' : ''}`}
                    value={this.state.editedComment !== null ? this.state.editedComment : this.state.commentObject.comment}
                    onChange={this.change.bind(this)}
                    displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}
                    readOnly={readonlyTextField}>
                    <Mention trigger="@" data={
                        (search, callback) => {
                            fetchMatchingMentions(this.props.accessToken, search).then(callback);
                        }
                    }
                    renderSuggestion={renderCoamMentionSuggestion}/>
                </MentionsInput>
                {this.renderError(this.state.errorPut, this.tt('unable_to_edit_comment'))}
                {this.renderError(this.state.errorDelete, this.tt('unable_to_delete_comment'))}
                {editMenu}
            </div>
        );

        let error = this.renderError(this.state.error, this.tt('unable_to_read_comment'));
        if (error) {
            return <div className={this.props.className}>{error}</div>;
        }

        let header = this.props.header;
        let avatar = null;
        if (typeof header === 'undefined') {
            let commentCreator = <CommentAuthor
                accessToken={this.props.accessToken}
                createdBy={this.state.commentObject.createdBy}/>;

            let commentTime = <CommentTime
                locale={this.props.locale}
                accessToken={this.props.accessToken}
                createdBy={this.state.commentObject.createdBy}
                createdAt={this.state.commentObject.createdAt}
                updatedBy={this.state.commentObject.updatedBy}
                updatedAt={this.state.commentObject.updatedAt}/>;

            let additionalCommentIndicators = <span className={'comment-creator'}>
                <CommentVisibilityIcon icon={visibilityOption.icon} label={visibilityOption.label}/>
                <CommentRefererIcon referer={this.state.commentObject.referer}/>
            </span>;

            avatar = <CommentAuthorAvatar userId={this.state.commentObject.createdBy}
                accessToken={this.props.accessToken}/>;

            header = <span className={'comment-creator'}>{commentCreator}{commentTime ?
                <span>,&nbsp;</span> : null}{commentTime}{additionalCommentIndicators}</span>;
        }

        return <div className={this.props.className}>
            <div>
                {avatar}
            </div>
            <div>
                {header}
                <div className={'comment-body'}>
                    {commentBody}
                </div>
                {this.props.footer}
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
    deleteComments: PropTypes.bool,
    onDelete: PropTypes.func,
    header: PropTypes.node,
    footer: PropTypes.node,
    commentVisibilityLevels: PropTypes.array,
    commentsClient: PropTypes.any,
};

Comment.defaultProps = {
    locale: 'eng',
    className: 'comment',
};

export default translate('translations', {i18n: getI18nInstance()})(Comment);
