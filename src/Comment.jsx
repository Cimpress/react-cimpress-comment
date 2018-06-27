import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import '../style/index.css';

import TimeAgo from 'react-timeago';
import {reactTimeAgoFormatters} from './locales/all';

import CommentClient from './clients/CommentClient';
import CommentVisibilityIcon from './CommentVisibilityIcon';
import {getSubFromJWT} from './helper';
import {Mention, MentionsInput} from 'react-mentions';
import MentionsClient from './clients/MentionsClient';
import {shapes, Alert} from '@cimpress/react-components';
import {TextBlock} from 'react-placeholder/lib/placeholders';

import {translate} from 'react-i18next';
import {getI18nInstance} from './i18n';
import {errorToString} from './helper';

let {Spinner} = shapes;

let globalCacheKey = Symbol();
let globalCache = {};

class _Comment extends React.Component {
    constructor(props) {
        super(props);
        this.commentClient = new CommentClient(props.accessToken, props.commentUri);
        this.mentionsClient = new MentionsClient(props.accessToken);
        this.jwtSub = getSubFromJWT(props.accessToken);

        this.state = {
            editMode: false,
            editedComment: null,
            savingComment: props.comment && !props.comment.createdAt && !props.comment.updatedAt,
            comment: (props.comment) ? props.comment.comment : '',
            visibility: (props.comment) ? props.comment.visibility : null,
            createdBy: (props.comment) ? props.comment.createdBy : '',
            createdByName: (props.comment) ? this[globalCacheKey][props.comment.createdBy] : null,
            createdAt: (props.comment) ? props.comment.createdAt : '',
            updatedBy: (props.comment) ? props.comment.updatedBy : '',
            updatedByName: (props.comment) ? this[globalCacheKey][props.comment.updatedBy] : null,
            updatedAt: (props.comment) ? props.comment.updatedAt : '',
            visible: false,
        };
    }

    get [globalCacheKey]() {
        return globalCache;
    }

    componentWillReceiveProps(newProps) {
        let accessTokenChanged = this.props.accessToken !== newProps.accessToken;
        let commentUriChanged = this.props.commentUri !== newProps.commentUri;

        if (accessTokenChanged || commentUriChanged) {
            this.commentClient = new CommentClient(newProps.accessToken, newProps.commentUri);
            this.jwtSub = getSubFromJWT(newProps.accessToken);
        }

        if (accessTokenChanged) {
            this.mentionsClient = new MentionsClient(newProps.accessToken);
        }

        if (commentUriChanged) {
            this.setState({
                comment: (newProps.comment) ? newProps.comment.comment : '',
                visibility: (props.comment) ? props.comment.visibility : null,
                createdBy: (newProps.comment) ? newProps.comment.createdBy : '',
                createdAt: (newProps.comment) ? newProps.comment.createdAt : '',
                updatedBy: (newProps.comment) ? newProps.comment.updatedBy : '',
                updatedAt: (newProps.comment) ? newProps.comment.updatedAt : '',
                updatedByName: (newProps.comment) ? this[globalCacheKey][newProps.comment.updatedBy] : null,
                createdByName: (newProps.comment) ? this[globalCacheKey][newProps.comment.createdBy] : null
            }, () => {
                this.fetchComment(this.state.visible)
            });
        }
    }

    fetchUserName(userId, stateToUpdate) {

        if (this[globalCacheKey][userId]) {
            this.setState({
                [stateToUpdate]: this[globalCacheKey][userId]
            });
        }

        return this.mentionsClient
            .fetchUserName(userId)
            .then((responseJson) => {
                this[globalCacheKey][userId] = responseJson.profile.name;
                this.setState({
                    [stateToUpdate]: responseJson.profile.name
                });
            });
    }

    putComment(comment, visibility) {
        return this.commentClient.putComment(comment, visibility);
    }

    fetchComment(isVisible) {
        const TEMP_ID_LENGTH = 5;
        this.setState({
            visible: isVisible
        });
        let commentId = this.props.commentUri.substr(this.props.commentUri.lastIndexOf('/') + 1)
        // Make sure not to call for comments which are stored with placeholder id
        // They will get a real id once save operation is successful
        if (isVisible && commentId.length !== TEMP_ID_LENGTH) {
            return this.commentClient
                .fetchComment()
                .then(responseJson => {
                    this.setState({
                        error: undefined,
                        comment: responseJson.comment,
                        visibility: responseJson.visibility,
                        updatedBy: responseJson.updatedBy,
                        createdBy: responseJson.createdBy,
                        createdAt: responseJson.createdAt,
                        updatedAt: responseJson.updatedAt,
                        updatedByName: this[globalCacheKey][responseJson.updatedBy],
                        createdByName: this[globalCacheKey][responseJson.createdBy],
                    });
                    if (responseJson.updatedBy) {
                        this.fetchUserName(responseJson.updatedBy, 'updatedByName');
                    }
                    if (responseJson.createdBy) {
                        this.fetchUserName(responseJson.createdBy, 'createdByName');
                    }
                }).catch(err => {
                    this.setState({error: err});
                    console.error(err);
                });
        }
        return Promise.resolve();
    }

    change(event, newValue, newPlainTextValue, mentions) {
        this.setState({
            editedComment: newValue
        });
    }

    completeEditing() {
        this.setState({
            savingComment: true
        });
        if (this.state.editedComment !== null && this.state.editedComment !== this.state.comment) {
            this.putComment(this.state.editedComment.trim(), this.state.visibility).then((responseJson) => {
                this.setState({
                    editedComment: null,
                    editMode: false,
                    savingComment: false,
                    comment: responseJson.comment,
                    updatedBy: responseJson.updatedBy,
                    createdBy: responseJson.createdBy,
                    createdAt: responseJson.createdAt,
                    updatedAt: responseJson.updatedAt
                });
            }).catch((err) => {
                console.log(err);
                this.setState({
                    errorPut: err,
                    savingComment: false
                });
            });
        } else {
            this.setState({
                editedComment: null,
                editMode: false,
                savingComment: false
            });
        }
    }

    cancelEditing() {
        this.setState({
            errorPut: undefined,
            editedComment: null,
            editMode: false
        });
        this.fetchComment(this.state.isVisible);
    }

    authorPlaceholder = (
        <div>
            <TextBlock rows={1} color='lightgray' style={{width: 30, height: 5, marginTop: 10, marginBottom: 10}}/>
        </div>
    );

    commentPlaceholder = (
        <div>
            <TextBlock rows={2} color='gray' lineSpacing={4} style={{width: 30, height: 30}}/>
        </div>
    );

    tt(key) {
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderError(e, prefix) {
        if (!e) {
            return null;
        }
        return <span className={'text-danger'}>&nbsp;<i
            className={'fa fa-exclamation-triangle'}/>&nbsp;{prefix}{prefix ?
            <span>&nbsp;</span> : null}({this.tt(errorToString(e))})</span>
    }

    render() {
        let classes = 'mentions disabled';
        let editMenu = null;
        if (this.state.savingComment === true) {
            classes = 'mentions disabled';
            editMenu = <div className={'mentions-edit'}><Spinner size={20}/></div>;
        } else if (this.props.editComments === true && (this.state.createdBy === this.jwtSub || this.state.updatedBy === this.jwtSub)) {
            if (this.state.editMode) {
                classes = 'mentions';
                let completeEdit = <div onClick={this.completeEditing.bind(this)}
                                        className={'fa fa-check mentions-ok'}/>;
                let cancelEdit = <div onClick={this.cancelEditing.bind(this)}
                                      className={'fa fa-undo mentions-cancel'}/>;
                editMenu = (<div>
                    {(this.state.editedComment !== null && this.state.editedComment !== this.state.comment && this.state.editedComment !== '')
                        ? completeEdit
                        : null}
                    {cancelEdit}
                </div>);
            } else {
                editMenu = <div onClick={() => {
                    this.setState({editMode: true});
                }} className={'mentions-edit fa fa-edit'}/>;
            }
        }

        let icon = null;

        if (this.state.visibility) {
            let visibilityOption = this.props.commentVisibilityLevels.find(l => l.value === this.state.visibility);
            icon = (
                <CommentVisibilityIcon
                    icon={visibilityOption.icon}
                    label={visibilityOption.label}/>
            );
        }

        let commentBody = (
            <div style={{position: 'relative'}}>
                <MentionsInput className={classes}
                               value={this.state.editedComment !== null ? this.state.editedComment : this.state.comment}
                               onChange={this.change.bind(this)}
                               displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}
                               readOnly={classes.includes('disabled')}>
                    <Mention trigger="@" data={(search, callback) => {
                        this.mentionsClient.fetchMatchingMentions(search).then(callback);
                    }}/>
                </MentionsInput>
                {this.renderError(this.state.errorPut)}
                {editMenu}
            </div>
        );

        let modified = <span>, {this.tt('modified')} {(this.state.updatedBy !== this.state.createdBy)
            ? `${this.tt('by')} ${this.state.updatedByName || this.state.updatedBy}`
            : null} <TimeAgo date={this.state.updatedAt} formatter={reactTimeAgoFormatters[this.props.locale]}/></span>;

        let error = this.renderError(this.state.error, this.tt('unable_to_read_comment'));

        return (
            <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComment.bind(this)}>
                {error
                    ? <div className={this.props.className || 'comment'}>{error}</div>
                    : <div className={this.props.className || 'comment'}>
                        <ReactPlaceholder showLoadingAnimation customPlaceholder={this.authorPlaceholder}
                                          ready={Boolean(this.state.createdAt && this.state.updatedAt)}>
                            <div className={'comment-creator'}>
                                {this.state.createdBy
                                    ? `${this.state.createdByName || this.state.createdBy}, `
                                    : null}
                                <TimeAgo date={this.state.createdAt}
                                         formatter={reactTimeAgoFormatters[this.props.locale]}/>
                                {this.state.createdAt !== this.state.updatedAt
                                    ? modified
                                    : null}
                                {icon}
                            </div>
                        </ReactPlaceholder>
                        <div className={'comment-body'}>
                            <ReactPlaceholder showLoadingAnimation customPlaceholder={this.commentPlaceholder}
                                              ready={Boolean(this.state.comment)}>
                                {commentBody}
                            </ReactPlaceholder>
                        </div>
                    </div>
                }
            </VisibilitySensor>
        );
    }
}

_Comment.propTypes = {
    locale: PropTypes.string,
    className: PropTypes.string,
    accessToken: PropTypes.string,
    commentUri: PropTypes.string,
    comment: PropTypes.object,
    editComments: PropTypes.bool
};

_Comment.defaultProps = {
    locale: 'eng'
};

export default translate('translations', {i18n: getI18nInstance()})(_Comment);
