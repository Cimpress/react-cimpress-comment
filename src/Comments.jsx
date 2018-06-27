import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import '../style/select.css';
import {getVisibilityLevels} from './visibility';
import CommentVisibilityOption from './CommentVisibilityOption';
import {Alert, shapes, Select} from '@cimpress/react-components';
import CommentsClient from './clients/CommentsClient';
import {Mention, MentionsInput} from 'react-mentions';
import MentionsClient from './clients/MentionsClient';
import CustomizrClient from './clients/CustomizrClient';

import {getI18nInstance} from './i18n';
import {translate} from 'react-i18next';
import {errorToString} from './helper';

let {Spinner} = shapes;

class _Comments extends React.Component {
    constructor(props) {
        super(props);

        this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
        this.mentionsClient = new MentionsClient(props.accessToken);
        this.customizrClient = new CustomizrClient(props.accessToken);

        this.state = {
            blockEnter: false,
            visible: false,
            loading: false,
            commentsIds: [],
            commentObjects: {},
            commentToAdd: props.initialValue || '',
            failed: false,
            failedPost: false,
            alertDismissed: true,
            commentVisibilityLevels: getVisibilityLevels(this.tt.bind(this)),
            selectedVisibilityOption: null,
            userAccessLevel: null
        };
    }

    componentWillMount() {
        setTimeout(() => this.forceFetchComments(), 10);
    }

    componentDidMount() {
        this._ismounted = true;
        this.componentWillReceiveProps(this.props);
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentWillReceiveProps(newProps) {
        this.customizrClient.fetchSettings().then(json => {
            this.setState({
                alertDismissed: json.mentionsUsageNotification &&
                    json.mentionsUsageNotification.alertDismissed === true,
                selectedVisibilityOption: this.state.commentVisibilityLevels.find(l => l.value === json.selectedVisibility)
            }, () => {
                this.resetSelectedVisibilityOption();
            });
        });

        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.forceFetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));

        let accessTokenChanged = this.props.accessToken !== newProps.accessToken;
        let resourceUriChanged = this.props.resourceUri !== newProps.resourceUri;

        if (accessTokenChanged) {
            // new props - recreate
            this.mentionsClient = new MentionsClient(newProps.accessToken);
            this.customizrClient = new CustomizrClient(newProps.accessToken);
        }

        if (accessTokenChanged || resourceUriChanged) {
            // new props - recreate
            this.commentsClient = new CommentsClient(newProps.accessToken, newProps.resourceUri);
        }

        if (resourceUriChanged) {
            this.setState({
                failed: false,
                failedPost: false,
                commentsIds: []
            }, () => this.forceFetchComments());
        }

        this.resetSelectedVisibilityOption();
    }

    onInputChange(event, newValue, newPlainTextValue, mentions) {
        this.setState({commentToAdd: newValue});
    }

    onVisibilityChange = selectedVisibilityOption => {
        this.customizrClient.updateSettings({selectedVisibility: selectedVisibilityOption.value})
        this.setState({selectedVisibilityOption});
    };

    addComment(e) {
        this.postComment(this.state.commentToAdd);
    }

    fetchComments(isVisible) {
        this.setState({
            visible: isVisible
        });
        if (isVisible && this.props.resourceUri) {
            this.forceFetchComments();
        }
    }

    resetSelectedVisibilityOption() {
        let newCommentVisibilityLevels = getVisibilityLevels(this.tt.bind(this), this.state.userAccessLevel);
        let narrowestAvailableVisibilityOptionIndex = newCommentVisibilityLevels.every(l => !l.disabled) ?
            newCommentVisibilityLevels.length - 1 :
            newCommentVisibilityLevels.findIndex(l => l.disabled) - 1;

        let preferredVisibilityOptionIndex = this.state.selectedVisibilityOption ?
            newCommentVisibilityLevels.findIndex(l => l.value === this.state.selectedVisibilityOption.value) :
            newCommentVisibilityLevels.length - 1;

        let selectedVisibilityOptionIndex = Math.min(narrowestAvailableVisibilityOptionIndex, preferredVisibilityOptionIndex);

        this.setState({
            commentVisibilityLevels: newCommentVisibilityLevels,
            selectedVisibilityOption: newCommentVisibilityLevels[selectedVisibilityOptionIndex]
        });
    }

    forceFetchComments() {
        if (!this._ismounted) {
            return;
        }

        this.setState({
            loading: true,
            failed: false
        });

        let currentClient = this.commentsClient;
        currentClient.fetchComments().then(({responseJson, userAccessLevel}) => {
            this.setState({userAccessLevel}, () => {
                this.resetSelectedVisibilityOption();
            });

            if (currentClient.resourceUri === this.props.resourceUri && this._ismounted) {
                this.setState({
                    loading: false,
                    failed: false,
                    commentsIds: responseJson.sort((a, b) => {
                        if (this.props.newestFirst === true) {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        } else {
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        }
                    }).map(c => c.id),
                    commentObjects: responseJson.reduce((acc, curr) => {
                        acc[curr.id] = curr;
                        return acc
                    }, {})
                });
            }
        }).catch(err => {
            if (currentClient.resourceUri === this.props.resourceUri) {
                this.setState({
                    loading: false,
                    failed: true,
                    error: err
                });
            }
            console.error(err);
        }).then(() => {
            this.reportCommentCount();
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

        let newCommentObjects = Object.assign({[tempId]: {comment}}, this.state.commentObjects)
        this.setState({
            failed: false,
            error: undefined,
            commentToAdd: '',
            commentsIds: this.state.commentsIds.slice(0),
            commentObjects: newCommentObjects
        });

        return this.commentsClient
            .postComment(comment, this.state.selectedVisibilityOption.value)
            .then(() => this.fetchComments(this.state.visible))
            .then(() => this.reportCommentCount())
            .catch((err) => {
                console.log(err);
                let newCommentObjects = Object.assign({}, this.state.commentObjects);
                delete newCommentObjects[tempId];

                this.setState({
                    failedPost: true,
                    error: err,
                    commentsIds: this.state.commentsIds.filter(id => id !== tempId),
                    commentObjects: newCommentObjects
                });
            });
    }

    reportCommentCount() {
        if (this.props.commentCountRefreshed) {
            this.props.commentCountRefreshed(this.state.commentsIds.length);
        }
    }

    onAlertDismissed() {
        this.customizrClient.updateSettings({
            mentionsUsageNotification: {
                alertDismissed: true
            }
        });
        this.setState({
            alertDismissed: true
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
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    renderComments(commentIds) {
        let uri = this.commentsClient.getResourceUri();
        return commentIds.map((commentId, index) => (
            <Comment locale={this.props.locale} key={commentId} className={'comment ' + ((index % 2 === 0)
                ? 'comment-even'
                : 'comment-odd')}
                     accessToken={this.props.accessToken}
                     commentUri={`${uri}/${commentId}`} comment={this.state.commentObjects[commentId]}
                     editComments={this.props.editComments}
                     commentVisibilityLevels={this.state.commentVisibilityLevels}/>));
    }

    renderSuggestion(entry, search, highlightedDisplay, index) {
        return <span>{highlightedDisplay} <i><small>{entry.email}</small></i></span>
    }

    renderError(defaultErrorMessage, dismissible = false, onDismiss) {
        if (!this.state.failed && !this.state.failedPost) {
            return null;
        }

        let title;
        let e = this.state.error;
        let message;
        if (!e) {
            message = defaultErrorMessage
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
                    <Alert type={"info"}
                           message={<p>{this.tt('use_at_char_for_mentions')}</p>}
                           dismissible={true}
                           dismissed={this.state.alertDismissed}
                           onDismiss={this.onAlertDismissed.bind(this)}
                    />
                    {this.state.failedPost
                        ? this.renderError(this.tt('unable_to_post_comment'), true, () => {
                            this.setState({failedPost: false})
                        })
                        : null}
                </div>
                <MentionsInput className="mentions mentions-min-height"
                               value={this.state.commentToAdd}
                               onChange={this.onInputChange.bind(this)}
                               displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}>
                    <Mention trigger="@"
                             data={(search, callback) => {
                                 this.mentionsClient.fetchMatchingMentions(search).then(callback)
                             }}
                             renderSuggestion={this.renderSuggestion}
                    />
                </MentionsInput>
                <div style={{display: 'table'}}>
                    <Select
                        label="Show my comment to"
                        value={this.state.selectedVisibilityOption}
                        options={this.state.commentVisibilityLevels}
                        onChange={this.onVisibilityChange}
                        searchable={false}
                        clearable={false}
                        optionComponent={CommentVisibilityOption}
                    />
                    <span className="input-group-btn" style={{display: 'table-cell'}}>
                          <button
                              disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === '' || !this.state.selectedVisibilityOption}
                              onClick={this.addComment.bind(this)} className="btn btn-default">
                            {this.tt('btn_post')}
                          </button>
                      </span>
                </div>
            </div>
        );

        return (
            <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComments.bind(this)}>
                <div>
                    {this.props.newestFirst
                        ? addCommentBox
                        : null}
                    <div className="comments">
                        {comments}
                    </div>
                    {!this.props.newestFirst
                        ? addCommentBox
                        : null}
                </div>
            </VisibilitySensor>
        );
    }
}

_Comments.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool,
    editComments: PropTypes.bool,
    refreshInterval: PropTypes.number,
    commentCountRefreshed: PropTypes.func,
    initialValue: PropTypes.string
};

_Comments.defaultProps = {
    locale: 'eng'
};

export default translate("translations", {i18n: getI18nInstance()})(_Comments);
