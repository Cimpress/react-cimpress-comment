import React from 'react';
import PropTypes from 'prop-types';

import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import '../style/select.css';

import Comment from './components/Comment';
import CommentVisibilityOption from './components/CommentVisibilityOption';

import {getVisibilityLevels} from './tools/visibility';
import {Mention, MentionsInput} from 'react-mentions';
import {Alert, shapes, Select} from '@cimpress/react-components';

import CommentsClient from './clients/CommentsClient';
import MentionsClient from './clients/MentionsClient';
import CustomizrClient from './clients/CustomizrClient';

import {getI18nInstance} from './tools/i18n';
import {translate, Trans} from 'react-i18next';
import {errorToString, getSubFromJWT} from './tools/helper';

let {Spinner} = shapes;

class Comments extends React.Component {
    constructor(props) {
        super(props);

        this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
        this.mentionsClient = new MentionsClient(props.accessToken);
        this.customizrClient = new CustomizrClient(props.accessToken);

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
            selectedVisibilityOption: null,
            userAccessLevel: null,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        this.init();
        this.fetchComments();
        this.resetSelectedVisibilityOption();
    }

    componentDidUpdate(prevProps) {
        if (this.props.resourceUri !== prevProps.resourceUri) {
            this.fetchComments();
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
        clearInterval(this.refreshIntervalHandle);
    }

    init() {
        clearInterval(this.refreshIntervalHandle);
        this.refreshIntervalHandle = setInterval(() => this.fetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));

        // Get the settings (it won't make a network call as the data is cached!
        this.customizrClient.fetchSettings()
            .then((json) => {
                let newAlertDismissed = json.mentionsUsageNotification && json.mentionsUsageNotification.alertDismissed === true;
                let newSelectedVisibilityOption = this.state.commentVisibilityLevels.find((l) => l.value === json.selectedVisibility);
                // Only update the state if there is change
                if (this.state.alertDismissed !== newAlertDismissed || this.state.selectedVisibilityOption !== newSelectedVisibilityOption) {
                    this.setState({
                        alertDismissed: newAlertDismissed,
                        selectedVisibilityOption: newSelectedVisibilityOption,
                    }, () => {
                        this.resetSelectedVisibilityOption();
                    });
                }
            });

        // Creating these clients is inexpensive and do not clear caching
        this.mentionsClient = new MentionsClient(this.props.accessToken);
        this.customizrClient = new CustomizrClient(this.props.accessToken);
        this.commentsClient = new CommentsClient(this.props.accessToken, this.props.resourceUri);
    }

    resetSelectedVisibilityOption() {
        let newCommentVisibilityLevels = getVisibilityLevels(this.tt.bind(this), this.state.userAccessLevel);
        let narrowestAvailableVisibilityOptionIndex = newCommentVisibilityLevels.every((l) => !l.disabled) ?
            newCommentVisibilityLevels.length - 1 :
            newCommentVisibilityLevels.findIndex((l) => l.disabled) - 1;

        let preferredVisibilityOptionIndex = this.state.selectedVisibilityOption ?
            newCommentVisibilityLevels.findIndex((l) => l.value === this.state.selectedVisibilityOption.value) :
            newCommentVisibilityLevels.length - 1;

        let selectedVisibilityOptionIndex = Math.min(narrowestAvailableVisibilityOptionIndex, preferredVisibilityOptionIndex);

        if (this.state.commentVisibilityLevels !== newCommentVisibilityLevels ||
            this.state.selectedVisibilityOption !== newCommentVisibilityLevels[selectedVisibilityOptionIndex]) {
            this.setState({
                commentVisibilityLevels: newCommentVisibilityLevels,
                selectedVisibilityOption: newCommentVisibilityLevels[selectedVisibilityOptionIndex],
            });
        }
    }

    fetchComments() {
        this.setState({
            loading: true,
            failed: false,
        });

        this.commentsClient
            .fetchComments()
            .then(({responseJson, userAccessLevel}) => {
                if (!this._ismounted) {
                    return;
                }

                this.setState({
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
                    this.resetSelectedVisibilityOption();
                });
            })
            .catch((err) => {
                this.setState({
                    loading: false,
                    failed: true,
                    error: err,
                });
            });
    }

    postComment(comment) {
        if (!comment || comment.length === 0) {
            return;
        }
        let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

        if (this.props.newestFirst) {
            this.state.commentsIds.unshift(tempId);
        } else {
            this.state.commentsIds.push(tempId);
        }

        let newCommentObjects = Object.assign({[tempId]: {comment}}, this.state.commentObjects);
        this.setState({
            failed: false,
            error: undefined,
            commentToAdd: '',
            commentsIds: this.state.commentsIds.slice(0),
            commentObjects: newCommentObjects,
        });

        return this.commentsClient
            .postComment(comment, this.state.selectedVisibilityOption.value)
            .then(() => this.fetchComments())
            .catch((err) => {
                let newCommentObjects = Object.assign({}, this.state.commentObjects);
                delete newCommentObjects[tempId];

                this.setState({
                    failedPost: true,
                    error: err,
                    commentsIds: this.state.commentsIds.filter((id) => id !== tempId),
                    commentObjects: newCommentObjects,
                });
            });
    }

    onAlertDismissed() {
        this.customizrClient.updateSettings({
            mentionsUsageNotification: {
                alertDismissed: true,
            },
        });
        this.setState({
            alertDismissed: true,
        });
    }

    renderLoading() {
        return (
            <div>
                <div className="inline-spinner"><Spinner size={20}/></div>
                <div className="inline-spinner">{this.tt('retrieving_comments')}</div>
            </div>
        );
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderComments(commentIds) {
        let uri = this.commentsClient.getResourceUri();

        return commentIds.map((commentId, index) => {
            let className = 'comment ' + ((index % 2 === 0) ? 'comment-even' : 'comment-odd');
            return <Comment
                key={commentId}
                locale={this.props.locale}
                className={className}
                jwtSub={getSubFromJWT(this.props.accessToken)}
                mentionsClient={this.mentionsClient}
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

        let addCommentBox = (
            <div className="comments-add">
                <div className='comments-alert'>
                    <Alert
                        type={'info'}
                        message={<p><Trans
                            defaults={this.tt('use_at_char_for_mentions')}
                            // eslint-disable-next-line react/jsx-key
                            components={[<strong>@</strong>]}
                        /></p>}
                        dismissible={true}
                        dismissed={this.state.alertDismissed}
                        onDismiss={this.onAlertDismissed.bind(this)}
                    />
                    {this.state.failedPost
                        ? this.renderError(this.tt('unable_to_post_comment'), true, () => {
                            this.setState({failedPost: false});
                        })
                        : null}
                </div>
                <MentionsInput
                    className="mentions mentions-min-height"
                    value={this.state.commentToAdd}
                    onChange={(e, newValue) => this.setState({commentToAdd: newValue})}
                    displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}>
                    <Mention
                        trigger="@"
                        data={(search, callback) => {
                            this.mentionsClient.fetchMatchingMentions(search).then(callback);
                        }}
                        renderSuggestion={this.renderSuggestion}
                    />
                </MentionsInput>
                <div style={{display: 'table'}}>
                    <Select
                        label="Show my comment to"
                        value={this.state.selectedVisibilityOption}
                        options={this.state.commentVisibilityLevels}
                        onChange={(selectedVisibilityOption) => {
                            this.customizrClient.updateSettings({selectedVisibility: selectedVisibilityOption.value});
                            this.setState({selectedVisibilityOption});
                        }}
                        searchable={false}
                        clearable={false}
                        optionComponent={CommentVisibilityOption}
                    />
                    <span className="input-group-btn" style={{display: 'table-cell'}}>
                        <button
                            className="btn btn-default"
                            disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === '' || !this.state.selectedVisibilityOption}
                            onClick={() => this.postComment(this.state.commentToAdd)}>
                            {this.tt('btn_post')}
                        </button>
                    </span>
                </div>
            </div>
        );

        return <div>
            {this.props.newestFirst
                ? addCommentBox
                : null}
            <div className="comments">
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
};

Comments.defaultProps = {
    locale: 'eng',
};

export default translate('translations', {i18n: getI18nInstance()})(Comments);
