import React from 'react';
import PropTypes from 'prop-types';

import '../style/index.css';
import '../style/select.css';

import Comment from './components/Comment';

import {getVisibilityLevels} from './tools/visibility';
import {Alert, shapes} from '@cimpress/react-components';

import CommentsClient from './clients/CommentsClient';

import {getI18nInstance} from './tools/i18n';
import {translate} from 'react-i18next';
import {errorToString, getSubFromJWT} from './tools/helper';
import AddNewCommentForm from './components/AddNewCommentForm';

let {Spinner} = shapes;

class Comments extends React.Component {
    constructor(props) {
        super(props);

        this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
        this.jwtSub = getSubFromJWT(this.props.accessToken);

        this.state = {
            blockEnter: false,
            loading: false,
            commentsIds: [],
            commentObjects: {},
            commentToAdd: props.initialValue || '',
            failed: false,
            failedPost: false,
            alertDismissed: true,
            commentVisibilityLevels: getVisibilityLevels(this.tt.bind(this)),
            userAccessLevel: null,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        this.init();
        this.fetchComments();
        this.resetSelectedVisibilityOptions();
    }

    componentDidUpdate(prevProps) {
        this.jwtSub = getSubFromJWT(this.props.accessToken);
        if (this.props.accessToken !== prevProps.accessToken) {
            this.jwtSub = getSubFromJWT(this.props.accessToken);
        }
        if (this.props.resourceUri !== prevProps.resourceUri) {
            this.commentsClient = new CommentsClient(this.props.accessToken, this.props.resourceUri);
            this.fetchComments();
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
        clearTimeout(this._markAsReadAfterHandle);
        clearInterval(this._refreshIntervalHandle);
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    init() {
        clearInterval(this._refreshIntervalHandle);
        this._refreshIntervalHandle = setInterval(() => this.fetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));

        // Creating these clients is inexpensive and do not clear caching
        this.commentsClient = new CommentsClient(this.props.accessToken, this.props.resourceUri);
    }

    resetSelectedVisibilityOptions() {
        let newCommentVisibilityLevels = getVisibilityLevels(this.tt.bind(this), this.state.userAccessLevel);

        if (this.state.commentVisibilityLevels !== newCommentVisibilityLevels) {
            this.safeSetState({
                commentVisibilityLevels: newCommentVisibilityLevels,
            });
        }
    }

    markAsReadAfter(date) {
        this.commentsClient.markAsReadAfter(date);
    }

    fetchComments() {
        this.safeSetState({
            loading: true,
            failed: false,
        });

        this.commentsClient
            .fetchComments()
            .then(({responseJson, userAccessLevel}) => {
                if (!this._ismounted) {
                    return;
                }

                const sortedComments = responseJson.sort((a, b) => {
                    if (this.props.newestFirst === true) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    } else {
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    }
                });

                const lastestCommentDate = sortedComments.length > 0
                    ? this.props.newestFirst
                        ? sortedComments[0].createdAt
                        : sortedComments[sortedComments.length - 1].createdAt
                    : null;

                this.safeSetState({
                    userAccessLevel: userAccessLevel,
                    loading: false,
                    failed: false,
                    commentsIds: responseJson.sort((a, b) => {
                        if (this.props.newestFirst === true) {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        } else {
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        }
                    }).map((c) => c.id),
                    commentObjects: responseJson.reduce((acc, curr) => {
                        acc[curr.id] = curr;
                        return acc;
                    }, {}),
                }, () => {
                    this.resetSelectedVisibilityOptions();
                });

                // mark all as read after 1s
                if (lastestCommentDate) {
                    this._markAsReadAfterHandle = setTimeout(() => this.markAsReadAfter(lastestCommentDate), 1000);
                }
            })
            .catch((err) => {
                this.safeSetState({
                    loading: false,
                    failed: true,
                    error: err,
                });
            });
    }

    postComment(comment, visibilty) {
        if (!comment || comment.length === 0) {
            return;
        }
        let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

        if (this.props.newestFirst) {
            this.state.commentsIds.unshift(tempId);
        } else {
            this.state.commentsIds.push(tempId);
        }

        let newCommentObjects = Object.assign({
            [tempId]: {
                createdBy: this.jwtSub,
                visibility: visibilty,
                comment: comment,
            },
        }, this.state.commentObjects);
        this.safeSetState({
            failed: false,
            failedPostComment: '',
            error: undefined,
            commentsIds: this.state.commentsIds.slice(0),
            commentObjects: newCommentObjects,
        });

        return this.commentsClient
            .postComment(comment, visibilty)
            .then(() => {
                this.safeSetState({
                    failedPost: false,
                    failedPostComment: '',
                    error: undefined,
                });
                this.fetchComments();
            })
            .catch((err) => {
                let newCommentObjects = Object.assign({}, this.state.commentObjects);
                delete newCommentObjects[tempId];

                this.safeSetState({
                    failedPost: true,
                    failedPostComment: comment,
                    error: err,
                    commentsIds: this.state.commentsIds.filter((id) => id !== tempId),
                    commentObjects: newCommentObjects,
                });
            });
    }

    renderLoading() {
        return (
            <div>
                <div className='inline-spinner'><Spinner size={20}/></div>
                <div className='inline-spinner'>{this.tt('retrieving_comments')}</div>
            </div>
        );
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderComments(commentIds) {
        let uri = this.commentsClient.getResourceCommentsUri();
        let jwt = getSubFromJWT(this.props.accessToken);

        return commentIds.map((commentId, index) => {
            let className = 'comment ' + ((index % 2 === 0) ? 'comment-even' : 'comment-odd');
            return <Comment
                key={commentId}
                locale={this.props.locale}
                accessToken={this.props.accessToken}
                className={className}
                jwtSub={jwt}
                commentsClient={this.commentsClient}
                commentUri={`${uri}/${commentId}`}
                comment={this.state.commentObjects[commentId]}
                editComments={this.props.editComments}
                commentVisibilityLevels={this.state.commentVisibilityLevels}/>;
        });
    }

    renderSuggestion(entry, search, highlightedDisplay, index) {
        return <span>{highlightedDisplay} <i><small>{entry.email}</small></i></span>;
    }

    renderError(defaultErrorMessage, dismissible = false, onDismiss) {
        if (!this.state.failed && !this.state.failedPost) {
            return null;
        }

        let title;
        let e = this.state.error;
        let message;
        if (!e) {
            message = defaultErrorMessage;
        } else {
            let details = errorToString(e);
            title = defaultErrorMessage;
            message = this.tt(details);
        }
        return <Alert type={'danger'} title={title} message={message} dismissible={dismissible} onDismiss={onDismiss}/>;
    }

    render() {
        let comments = null;

        if (!this.props.resourceUri) {
            comments = (<p>{this.tt('incorrect_component_setup')}</p>);
        } else if (this.state.commentsIds.length > 0) {
            comments = this.renderComments(this.state.commentsIds);
        } else if (this.state.loading) {
            comments = this.renderLoading();
        } else if (this.state.failed) {
            comments = this.renderError(this.tt('unable_to_retrieve_comments'));
        } else {
            comments = <div className={'no-comments'}>{this.tt('no_comments_exist')}</div>;
        }

        let addCommentBox = <div>
            {this.state.failedPost
                ? this.renderError(this.tt('unable_to_post_comment'), true, () => {
                    this.safeSetState({failedPost: false});
                })
                : null}
            <AddNewCommentForm
                locale={this.props.locale}
                initialValue={this.state.failedPostComment || this.props.initialValue}
                accessToken={this.props.accessToken}
                commentsClient={this.commentsClient}
                resourceUri={this.props.resourceUri}
                newestFirst={this.props.newestFirst}
                showVisibilityLevels={this.props.showVisibilityLevels}
                enforceVisibilityLevel={this.props.enforceVisibilityLevel}
                textOverrides={this.props.textOverrides}
                onPostComment={(comment, visibilityOption) => this.postComment(comment, visibilityOption)}
            />
        </div>;

        return <div>
            {this.props.newestFirst
                ? addCommentBox
                : null}
            <div className='comments'>
                {comments}
            </div>
            {!this.props.newestFirst
                ? addCommentBox
                : null}
        </div>;
    }
}

Comments.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool,
    editComments: PropTypes.bool,
    refreshInterval: PropTypes.number,
    commentCountRefreshed: PropTypes.func,
    initialValue: PropTypes.string,
    showVisibilityLevels: PropTypes.bool,
    enforceVisibilityLevel: PropTypes.oneOf(['public', 'internal']),
    textOverrides: PropTypes.shape({
        placeholder: PropTypes.string,
        subscribe: PropTypes.string,
        unsubscribe: PropTypes.string,
        postComment: PropTypes.string,
    }),
};

Comments.defaultProps = {
    locale: 'eng',
    showVisibilityLevels: true,
    textOverrides: {
        placeholder: null,
        subscribe: null,
        unsubscribe: null,
        postComment: null,
    },
};

export default translate('translations', {i18n: getI18nInstance()})(Comments);
