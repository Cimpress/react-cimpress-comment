import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import { TextField, shapes } from '@cimpress/react-components';
import CommentsClient from './CommentsClient';
import { SERVICE_URL } from '../config';
import { getSubFromJWT } from '../lib';

let {Spinner} = shapes;

export default class _Comments extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = SERVICE_URL;
    this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
    this.state = {
      visible: false,
      loading: false,
      commentsIds: [],
      commentObjects: {},
      commentToAdd: '',
      failed: false
    };
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

  componentWillMount(){
    this.forceFetchComments();
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

  onInputChange (e) {
    this.setState({commentToAdd: e.target.value});
  }

  addComment (e) {
    if (e.keyCode) {
      if (e.keyCode === 13) { // The "Enter" key was pressed.
        this.postComment(this.state.commentToAdd);
      }
    } else {
      this.postComment(this.state.commentToAdd);
    }
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
    this.setState({
      loading: true,
      failed: false
    });
    let currentClient = this.commentsClient;
    currentClient.fetchComments().then(responseJson => {
      if (currentClient.resourceUri === this.props.resourceUri) {
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
      console.log(err);
    }).then(() => {
      this.reportCommentCount();
    });
  }

  postComment (comment) {
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
    return this.commentsClient.postComment(comment).then(() => this.fetchComments(this.state.visible)).then(()=>
    {
      this.reportCommentCount();
    })
  }

  reportCommentCount () {
    if (this.props.commentCountRefreshed) {
      this.props.commentCountRefreshed(this.state.commentsIds.length);
    }
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

    let addCommentBox = <TextField
      name="autoFocus"
      placeholder="Put your comment here, and ..."
      value={this.state.commentToAdd}
      autoFocus
      onChange={this.onInputChange.bind(this)}
      onKeyDown={this.addComment.bind(this)}
      rightAddon={
        <button disabled={!this.props.resourceUri || this.state.commentToAdd.trim() === ''} onClick={this.addComment.bind(this)} className="btn btn-default">
          post
        </button>
      }
    />;

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
  commentCountRefreshed: PropTypes.func
};
