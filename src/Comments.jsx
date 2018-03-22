import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import { shapes } from '@cimpress/react-components';
import { Alert } from '@cimpress/react-components';

let {Spinner} = shapes;

import CommentsClient from './CommentsClient';
import { SERVICE_URL, CUSTOMIZR_URL } from './config';
import { MentionsInput, Mention } from 'react-mentions';
import MentionsClient from './MentionsClient';

export default class _Comments extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = SERVICE_URL;
    this.customizrResource = `http://comment.trdlnk.cimpress.io/`
    this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
    this.mentionsClient = new MentionsClient(props.accessToken);
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
  }

  componentWillMount () {
    setTimeout(() => this.forceFetchComments(), 10);
  }

  componentDidMount() {
    this._ismounted = true;
    fetch(`${CUSTOMIZR_URL}/v1/settings?resourceId=${this.customizrResource}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${this.props.accessToken}`,
      },
    }).then(res => {
      return res.json();
    }).then(json => {
      if (this._ismounted) {
        this.setState({alertDismissed: json.data
          && json.data.mentionsUsageNotification
          && json.data.mentionsUsageNotification.alertDismissed === true})
      }
    })
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  componentWillReceiveProps (newProps) {
    clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => this.forceFetchComments(), Math.max((this.props.refreshInterval || 60) * 1000, 5000));
    this.commentsClient = new CommentsClient(newProps.accessToken, newProps.resourceUri);
    if (newProps.resourceUri !== this.props.resourceUri) {
      this.setState({
        failed: false,
        commentsIds: []
      }, () => this.forceFetchComments());
    }
  }

  onInputChange (event, newValue, newPlainTextValue, mentions) {
      this.setState({commentToAdd: newValue});
  }

  addComment (e) {
    this.postComment(this.state.commentToAdd);
  }

  fetchComments (isVisible) {
    this.setState({
      visible: isVisible
    });
    if (isVisible && this.props.resourceUri) {
      this.forceFetchComments();
    }
  }

  forceFetchComments () {
    if (!this._ismounted) {
      return;
    }

    this.setState({
      loading: true,
      failed: false
    });
    let currentClient = this.commentsClient;
    currentClient.fetchComments().then(responseJson => {
      if (currentClient.resourceUri === this.props.resourceUri && this._ismounted) {
        this.setState({
          loading: false,
          failed: false,
          commentsIds: responseJson.sort((a, b) => {
            if (this.props.newestFirst === true) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
          }).map(c => c.id),
          commentObjects: responseJson.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {})
        });
      }
    }).catch(err => {
      if (currentClient.resourceUri === this.props.resourceUri) {
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

  postComment (comment) {
    if (!comment || comment.length === 0) {
      return;
    }
    let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    if (this.props.newestFirst) {
      this.state.commentsIds.unshift(tempId);
    } else {
      this.state.commentsIds.push(tempId);
    }
    this.setState({
      commentToAdd: '',
      commentsIds: this.state.commentsIds.slice(0),
      commentsObjects: Object.assign({[tempId]: {comment}}, this.state.commentObjects)
    });
    return this.commentsClient.postComment(comment).then(() => this.fetchComments(this.state.visible)).then(() => {
      this.reportCommentCount();
    });
  }

  reportCommentCount () {
    if (this.props.commentCountRefreshed) {
      this.props.commentCountRefreshed(this.state.commentsIds.length);
    }
  }

  onAlertDismissed() {
    fetch(`${CUSTOMIZR_URL}/v1/settings`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.props.accessToken}`,
      },
      data: {
        resourceId: this.customizrResource,
        data: {
          mentionsUsageNotification: {
            alertDismissed: true
          }
        }
      }
    })
  }

  render () {

    let encodedUri = encodeURIComponent(this.props.resourceUri);
    let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}/comments/`;
    let comments = null;

    if (!this.props.resourceUri) {
      comments = <p>Incorrect component setup.</p>;
    } else if (this.state.commentsIds.length > 0) {
      comments = this.state.commentsIds.map(
        (id, index) => <Comment className={'comment ' + ((index % 2 === 0) ? 'comment-even' : 'comment-odd')} key={id} accessToken={this.props.accessToken}
                                commentUri={url + id} comment={this.state.commentObjects[id]} editComments={this.props.editComments}/>);
    } else if (this.state.loading) {
      comments = <div>
        <div className="inline-spinner"><Spinner size={20}/></div>
        <div className="inline-spinner">Retrieving comments.</div>
      </div>;
    } else if (this.state.failed) {
      comments = <p>Unable to retrieve comments.</p>;
    } else {
      comments = <p>No comments here yet.</p>;
    }

    let addCommentBox = <div>
      <div
        className={'comments_alert'}>
        <Alert
          type={"info"}
          message={<p>Use <strong>@</strong> character to mention people. We will notify them via email about this comment thread.</p>}
          dismissible={true}
          dismissed={this.state.alertDismissed}
          onDismiss={this.onAlertDismissed.bind(this)}
        />
      </div>
      <div style={{display: 'table'}}>
      <MentionsInput className="mentions mentions-min-height" value={this.state.commentToAdd} onChange={this.onInputChange.bind(this)}
                     displayTransform={(id, display, type) => `@${display}`} allowSpaceInQuery={true}>
        <Mention trigger="@"
                 data={(search, callback) => { this.mentionsClient.fetchMatchingMentions(search).then(callback); }}
        />
      </MentionsInput>
      <span className="input-group-btn" style={{display: 'table-cell'}}>
          <button disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === ''} onClick={this.addComment.bind(this)} className="btn btn-default">
            post
          </button>
      </span>
      </div>
    </div>

    return (
      <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComments.bind(this)}>
        <div>
          {this.props.newestFirst ? addCommentBox : null}
          <div className="comments">
            {comments}
          </div>
          {!this.props.newestFirst ? addCommentBox : null}
        </div>
      </VisibilitySensor>
    );
  }
}

_Comments.propTypes = {
  accessToken: PropTypes.string.isRequired,
  resourceUri: PropTypes.string.isRequired,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool,
  refreshInterval: PropTypes.number,
  commentCountRefreshed: PropTypes.func,
  initialValue: PropTypes.string
};
