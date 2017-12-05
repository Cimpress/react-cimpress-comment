import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import { TextField, shapes } from '@cimpress/react-components';

let {Spinner} = shapes;

export default class _Comments extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = 'https://comment.staging.trdlnk.cimpress.io';
    this.state = {
      visible: false,
      loading: false,
      commentsIds: [],
      commentObjects: {},
      commentToAdd: '',
      failed: false
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.resourceUri !== this.props.resourceUri) {
      this.setState({
        failed: false,
        commentsIds: []
      }, () => this.fetchComments(this.state.visible));
    }
  }

  onInputChange (e) {
    this.setState({commentToAdd: e.target.value});
  }

  addComment (e) {
    if (e.keyCode) {
      if (e.keyCode === 13) {
        this.postComment(this.state.commentToAdd).then(() => {
          this.setState({commentToAdd: ''});
        });
      }
    } else {
      this.postComment(this.state.commentToAdd).then(() => {
        this.setState({commentToAdd: ''});
      });
    }
  }

  fetchComments (isVisible) {
    this.setState({
      visible: isVisible
    });
    if (isVisible && this.props.resourceUri) {
      this.setState({
        loading: true
      });
      let encodedUri = encodeURIComponent(this.props.resourceUri);
      let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}`;
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${this.props.accessToken}`);
      let init = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
      };
      fetch(url, init).then(response => {
        this.setState({
          loading: false
        });
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return this.createResource().then(responseJson => responseJson.comments);
        } else {
          throw new Error('Unable to fetch comments');
        }
      }).then(responseJson => {

        this.setState({
          commentsIds: responseJson.comments.sort((a, b) => {
            if (this.props.newestFirst === true) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
          }).map(c => c.id),
          commentObjects: responseJson.comments.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {})
        });
      }).catch(err => {
        this.setState({
          loading: false,
          failed: true
        });
        console.log(err);
      });
    }
  }

  createResource () {
    let url = `${this.commentServiceUrl}/v0/resources`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.props.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      URI: this.props.resourceUri,
      commentsIds: []
    };
    let init = {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(url, init).then(response => {
      if (response.status === 201) {
        return response.json();
      } else {
        throw new Error('Unable to create resource');
      }
    }).catch(err => {
      console.log(err);
    });
  }

  postComment (comment) {
    let encodedUri = encodeURIComponent(this.props.resourceUri);
    let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}/comments`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.props.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      comment: comment,
      URI: this.props.resourceUri
    };
    let init = {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    let tempId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    if (this.props.newestFirst) {
      this.state.commentsIds.unshift(tempId);
    } else {
      this.state.commentsIds.push(tempId);
    }
    this.setState({
      commentToAdd: '',
      commentsIds: this.state.commentsIds.slice(0),
      commentsObjects: Object.assign({ [tempId]: { comment } },this.state.commentObjects)
    });
    return fetch(url, init).then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        delete this.state.commentObjects[tempId];
        this.setState({
          commentToAdd: comment,
          commentsIds: this.state.commentsIds.filter(c => c !== tempId),
          commentsObjects: Object.assign(this.state.commentObjects)
        });
      }
    }).then(() => {
      return this.fetchComments(this.state.visible);
    }).catch(err => {
      console.log(err);
    });
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
        <button disabled={!this.props.resourceUri} onClick={this.addComment.bind(this)} className="btn btn-default">
          publish
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
  editComments: PropTypes.bool
};
