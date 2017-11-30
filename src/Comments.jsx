import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import Comment from './Comment';
import '../style/index.css';
import { TextField, shapes } from '@cimpress/react-components';

export default class Comments extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = "https://comment.staging.trdlnk.cimpress.io";
    this.state = {
      visible: false,
      loading: false,
      comments: [],
      commentToAdd: ''
    };
  }

  onInputChange (e) {
    this.setState({commentToAdd: e.target.value});
  }

  addComment () {
    this.postComment(this.state.commentToAdd).then(() => {
      this.setState({commentToAdd: ''});
    });
  }

  fetchComments (isVisible) {
    this.setState({
      visible: isVisible
    });
    if (isVisible) {
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
          comments: responseJson.comments.sort((a, b) => {
            if (this.props.newestFirst === true) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
          }).map(c => c.id)
        });
      }).catch(err => {
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
      comments: []
    };
    console.log(payload);
    let init = {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(url, init).then(response => {
      console.log(response);
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
    console.log(payload);
    let init = {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(url, init).then(response => {
      console.log(response);
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 404) {

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
    if (this.state.comments.length > 0) {
      comments = this.state.comments.map(
        (id, index) => <Comment className={'comment ' + ((index % 2 === 0) ? 'comment-even' : 'comment-odd')} key={id} accessToken={this.props.accessToken}
                                commentUri={url + id} editComments={this.props.editComments}/>);
    } else if (this.state.loading) {
      comments = <p>Retrieving comments.</p>;
    } else {
      comments = <p>No comments here yet.</p>;
    }

    let addCommentBox = <TextField
      name="autoFocus"
      placeholder="Put your comment here, and ..."
      value={this.state.commentToAdd}
      autoFocus
      onChange={this.onInputChange.bind(this)}
      rightAddon={
        <button onClick={this.addComment.bind(this)} className="btn btn-default">
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

Comments.propTypes = {
  accessToken: PropTypes.string,
  resourceUri: PropTypes.string,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool
};
