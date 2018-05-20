import React from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import 'react-placeholder/lib/reactPlaceholder.css'
import PropTypes from 'prop-types'
import Comment from './Comment'
import '../style/index.css'
import {Alert, shapes} from '@cimpress/react-components'
import CommentsClient from './clients/CommentsClient'
import {Mention, MentionsInput} from 'react-mentions'
import MentionsClient from './clients/MentionsClient'
import CustomizrClient from './clients/CustomizrClient'

import './i18n';
import {Trans, translate} from 'react-i18next';

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
            alertDismissed: true
        };
        props.i18n.changeLanguage(props.locale);
    }

    componentWillMount() {
        setTimeout(() => this.forceFetchComments(), 10)
    }

    componentDidMount() {
        this._ismounted = true;
        this.customizrClient.fetchSettings().then(json => {
            if ( this._ismounted ) {
                this.setState({
                    alertDismissed: json
                    && json.mentionsUsageNotification
                    && json.mentionsUsageNotification.alertDismissed === true
                })
            }
        })
    }

    componentWillUnmount() {
        this._ismounted = false
    }

    componentWillReceiveProps(newProps) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.forceFetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));

        let accessTokenChanged = this.props.accessToken !== newProps.accessToken;
        let resourceUriChanged = this.props.resourceUri !== newProps.resourceUri;
        let localeChanged = this.props.locale !== newProps.locale;

        if ( localeChanged ) {
            newProps.i18n.changeLanguage(newProps.locale);
        }

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
            }, () => this.forceFetchComments())
        }
    }

    onInputChange(event, newValue, newPlainTextValue, mentions) {
        this.setState({commentToAdd: newValue})
    }

    addComment(e) {
        this.postComment(this.state.commentToAdd)
    }

    fetchComments(isVisible) {
        this.setState({
            visible: isVisible
        });
        if ( isVisible && this.props.resourceUri ) {
            this.forceFetchComments()
        }
    }

    forceFetchComments() {
        if ( !this._ismounted ) {
            return
        }

        this.setState({
            loading: true,
            failed: false
        });
        let currentClient = this.commentsClient;
        currentClient.fetchComments().then(responseJson => {
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
                })
            }
        }).catch(err => {
            if ( currentClient.resourceUri === this.props.resourceUri ) {
                this.setState({
                    loading: false,
                    failed: true
                })
            }
            console.error(err)
        }).then(() => {
            this.reportCommentCount()
        })
    }

    postComment(comment) {
        if ( !comment || comment.length === 0 ) {
            return
        }
        let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

        if ( this.props.newestFirst ) {
            this.state.commentsIds.unshift(tempId)
        } else {
            this.state.commentsIds.push(tempId)
        }

        this.setState({
            commentToAdd: '',
            commentsIds: this.state.commentsIds.slice(0),
            commentsObjects: Object.assign({[tempId]: {comment}}, this.state.commentObjects)
        });

        return this.commentsClient.postComment(comment)
            .then(() => this.fetchComments(this.state.visible))
            .then(() => this.reportCommentCount());
    }

    reportCommentCount() {
        if ( this.props.commentCountRefreshed ) {
            this.props.commentCountRefreshed(this.state.commentsIds.length)
        }
    }

    onAlertDismissed() {
        this.customizrClient.putSettings({
            mentionsUsageNotification: {
                alertDismissed: true
            }
        });
    }

    renderLoading() {
        return <div>
            <div className="inline-spinner"><Spinner size={20}/></div>
            <div className="inline-spinner"><Trans>retrieving_comments</Trans></div>
        </div>
    }

    renderComments(commentIds) {
        let uri = this.commentsClient.getResourceUri();

        return commentIds.map((commentId, index) => (
            <Comment locale={this.props.locale}
                     key={commentId}
                     className={'comment ' + ((index % 2 === 0)
                         ? 'comment-even'
                         : 'comment-odd')}
                     accessToken={this.props.accessToken}
                     commentUri={`${uri}/${commentId}`} comment={this.state.commentObjects[commentId]}
                     editComments={this.props.editComments}/>));
    }

    render() {

        let comments = null;

        if ( !this.props.resourceUri ) {
            comments = <p><Trans>incorrect_component_setup</Trans></p>
        } else if ( this.state.commentsIds.length > 0 ) {
            comments = this.renderComments(this.state.commentsIds);
        } else if ( this.state.loading ) {
            comments = this.renderLoading();
        } else if ( this.state.failed ) {
            comments = <p><Trans>unable_to_retrieve_comments</Trans></p>
        } else {
            comments = <p><Trans>no_comments_exist</Trans></p>
        }

        let addCommentBox = <div>
            <div className={'comments_alert'}>
                <Alert type={"info"}
                       message={<p><Trans>use_at_char_for_mentions</Trans></p>}
                       dismissible={true}
                       dismissed={this.state.alertDismissed}
                       onDismiss={this.onAlertDismissed.bind(this)}
                />
            </div>
            <div style={{display: 'table'}}>
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
                <span className="input-group-btn" style={{display: 'table-cell'}}>
                      <button disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === ''}
                              onClick={this.addComment.bind(this)} className="btn btn-default">
                        <Trans>btn_post</Trans>
                      </button>
                  </span>
            </div>
        </div>;

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
        )
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

export default translate("translations")(_Comments);