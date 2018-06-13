import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import '../style/select.css';
import { getAccessibilityLevels } from './accessibility';
import AccessibilityOption from './AccessibilityOption';
import {Alert, shapes, Select} from '@cimpress/react-components';
import CommentsClient from './clients/CommentsClient';
import {Mention, MentionsInput} from 'react-mentions';
import MentionsClient from './clients/MentionsClient';
import CustomizrClient from './clients/CustomizrClient';

import {getI18nInstance} from './i18n';
import {translate} from 'react-i18next';

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
            alertDismissed: true,
            commentAccessibilityLevels: getAccessibilityLevels(this.tt.bind(this)),
            selectedAccessibilityOption: null,
            userAccessLevel: null
        };
    }

    componentWillMount() {
        setTimeout(() => this.forceFetchComments(), 10);
    }

    componentDidMount() {
        this._ismounted = true;
        this.customizrClient.fetchSettings().then(json => {
            this.setState({
                alertDismissed: json.mentionsUsageNotification &&
                    json.mentionsUsageNotification.alertDismissed === true,
                selectedAccessibilityOption: this.state.commentAccessibilityLevels.find(l => l.value === json.selectedAccessibility)
            }, () => { this.resetSelectedAccessibilityOption(); });
        })
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentWillReceiveProps(newProps) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.forceFetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));

        let accessTokenChanged = this.props.accessToken !== newProps.accessToken;
        let resourceUriChanged = this.props.resourceUri !== newProps.resourceUri;

        if ( accessTokenChanged ) {
            // new props - recreate
            this.mentionsClient = new MentionsClient(newProps.accessToken);
            this.customizrClient = new CustomizrClient(newProps.accessToken);
        }

        if ( accessTokenChanged || resourceUriChanged ) {
            // new props - recreate
            this.commentsClient = new CommentsClient(newProps.accessToken, newProps.resourceUri);
        }

        if ( resourceUriChanged ) {
            this.setState({
                failed: false,
                commentsIds: []
            }, () => this.forceFetchComments());
        }

        this.resetSelectedAccessibilityOption();
    }

    onInputChange(event, newValue, newPlainTextValue, mentions) {
        this.setState({commentToAdd: newValue});
    }

    onAccessibilityChange = selectedAccessibilityOption => {
        this.customizrClient.updateSettings({ selectedAccessibility: selectedAccessibilityOption.value })
        this.setState({ selectedAccessibilityOption });
    };

    addComment(e) {
        this.postComment(this.state.commentToAdd, this.state.selectedAccessibilityOption.value);
    }

    fetchComments(isVisible) {
        this.setState({
            visible: isVisible
        });
        if ( isVisible && this.props.resourceUri ) {
            this.forceFetchComments();
        }
    }

    resetSelectedAccessibilityOption() {
        let newCommentAccessibilityLevels = getAccessibilityLevels(this.tt.bind(this), this.state.userAccessLevel);
        let narrowestAvailableAccessibilityOptionIndex = newCommentAccessibilityLevels.every(l => !l.disabled) ?
            newCommentAccessibilityLevels.length - 1 :
            newCommentAccessibilityLevels.findIndex(l => l.disabled) - 1;

        let preferredAccessibilityOptionIndex = this.state.selectedAccessibilityOption ?
            newCommentAccessibilityLevels.findIndex(l => l.value === this.state.selectedAccessibilityOption.value) :
            newCommentAccessibilityLevels.length - 1;

        let selectedAccessibilityOptionIndex = Math.min(narrowestAvailableAccessibilityOptionIndex, preferredAccessibilityOptionIndex);

        this.setState({
            commentAccessibilityLevels: newCommentAccessibilityLevels,
            selectedAccessibilityOption: newCommentAccessibilityLevels[selectedAccessibilityOptionIndex]
        });
    }

    forceFetchComments() {
        if ( !this._ismounted ) {
            return;
        }

        this.setState({
            loading: true,
            failed: false
        });
        let currentClient = this.commentsClient;
        currentClient.fetchComments().then(({ responseJson, userAccessLevel }) => {
            this.setState({userAccessLevel}, () => {
                this.resetSelectedAccessibilityOption();
            });

            if ( currentClient.resourceUri === this.props.resourceUri && this._ismounted ) {
                this.setState({
                    loading: false,
                    failed: false,
                    commentsIds: responseJson.sort((a, b) => {
                        if ( this.props.newestFirst === true ) {
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
            if ( currentClient.resourceUri === this.props.resourceUri ) {
                this.setState({
                    loading: false,
                    failed: true
                });
            }
            console.error(err);
        }).then(() => {
            this.reportCommentCount();
        });
    }

    postComment(comment) {
        if ( !comment || comment.length === 0 ) {
            return;
        }
        let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

        if ( this.props.newestFirst ) {
            this.state.commentsIds.unshift(tempId);
        } else {
            this.state.commentsIds.push(tempId);
        }

        this.setState({
            commentToAdd: '',
            commentsIds: this.state.commentsIds.slice(0),
            commentsObjects: Object.assign({[tempId]: {comment}}, this.state.commentObjects)
        });

        return this.commentsClient.postComment(comment, this.state.selectedAccessibilityOption)
            .then(() => this.fetchComments(this.state.visible))
            .then(() => this.reportCommentCount())
            .catch((err) => {
                console.log(err);
                let newCommentsObjects = Object.assign({}, this.state.commentsObjects);
                delete newCommentsObjects[tempId];

                this.setState({
                    commentsIds: this.state.commentsIds.filter(id => id !== tempId),
                    commentsObjects: newCommentsObjects
                });
            });
    }

    reportCommentCount() {
        if ( this.props.commentCountRefreshed ) {
            this.props.commentCountRefreshed(this.state.commentsIds.length);
        }
    }

    onAlertDismissed() {
        this.customizrClient.updateSettings({
            mentionsUsageNotification: {
                alertDismissed: true
            }
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
                     commentAccessibilityLevels={this.state.commentAccessibilityLevels}/>));
    }

    render() {
        let comments = null;

        if ( !this.props.resourceUri ) {
            comments = (<p>{this.tt('incorrect_component_setup')}</p>);
        } else if ( this.state.commentsIds.length > 0 ) {
            comments = this.renderComments(this.state.commentsIds);
        } else if ( this.state.loading ) {
            comments = this.renderLoading();
        } else if ( this.state.failed ) {
            comments = (<p>{this.tt('unable_to_retrieve_comments')}</p>);
        } else {
            comments = (<p>{this.tt('no_comments_exist')}</p>);
        }

        let addCommentBox = (
            <div className="comments-add">
                <div>
                    <Alert type={"info"}
                           message={<p>{this.tt('use_at_char_for_mentions')}</p>}
                           dismissible={true}
                           dismissed={this.state.alertDismissed}
                           onDismiss={this.onAlertDismissed.bind(this)}
                    />
                </div>
                <div>
                    <MentionsInput className="mentions mentions-min-height"
                                   value={this.state.commentToAdd}
                                   onChange={this.onInputChange.bind(this)}
                                   displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}>
                        <Mention trigger="@"
                                 data={(search, callback) => {
                                     this.mentionsClient.fetchMatchingMentions(search).then(callback)
                                 }}
                        />
                    </MentionsInput>
                </div>
                <div style={{display: 'table'}}>
                    <Select
                        label="Show my comment to"
                        value={this.state.selectedAccessibilityOption}
                        options={this.state.commentAccessibilityLevels}
                        onChange={this.onAccessibilityChange}
                        searchable={false}
                        clearable={false}
                        optionComponent={AccessibilityOption}
                    />
                    <span className="input-group-btn" style={{display: 'table-cell', paddingLeft: "6px"}}>
                          <button disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === '' || !this.state.selectedAccessibilityOption}
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
