import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import { RIETextArea } from 'riek';
import PropTypes from 'prop-types';
import '../style/index.css';
import TimeAgo from 'react-timeago';

export default class Comment extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      comment: '',
      createdBy: null,
      createdByName: null,
      createdAt: null,
      updatedBy: null,
      updatedByName: null,
      updatedAt: null,
      visible: false,
      ready: false
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.commentUri !== this.props.commentUri) {
      this.setState({
        ready: false,
      }, () => this.fetchComment(this.state.visible));
    }
  }

  fetchUserName (userId) {
    let url = `https://api.cimpress.io/auth/access-management/v1/principals/${userId}`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.props.accessToken}`);
    let init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    return fetch(url, init).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(response.status);
    }).then((responseJson) => {
      return responseJson.profile.name;
    }).catch(err => {
      console.log(err);
    });
  }

  putComment (comment) {
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.props.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      comment: comment
    };
    console.log(payload);
    let init = {
      method: 'PUT',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(this.props.commentUri, init).then(response => {
      console.log(response);
      if (response.status === 200) {
        return Promise.resolve();
      } else {
        throw new Error('Unable to update comment');
      }
    });
  }

  fetchComment (isVisible) {
    this.setState({
      visible: isVisible
    });
    if (isVisible) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${this.props.accessToken}`);
      let init = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
      };
      fetch(this.props.commentUri, init).then(response => {
        if (response.status === 200) {
          return response.json();
        }
      }).then(responseJson => {
        this.setState({
          comment: responseJson.comment,
          updatedBy: responseJson.updatedBy,
          createdBy: responseJson.createdBy,
          createdAt: responseJson.createdAt,
          updatedAt: responseJson.updatedAt,
          ready: true
        });
        if (responseJson.updatedBy) {
          this.fetchUserName(responseJson.updatedBy).then(userName => {
            this.setState({
              updatedByName: userName
            });
          });
        }
        if (responseJson.createdBy) {
          this.fetchUserName(responseJson.createdBy).then(userName => {
            this.setState({
              createdByName: userName
            });
          });
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }

  change (e) {
    this.putComment(e.comment).then(() => this.setState({comment: e.comment})).catch(err => {
      console.log(err);
    });
  }

  render () {
    let commentBody = <span>{this.state.comment}</span>;
    if (this.props.editComments === true) {
      commentBody = <RIETextArea
        classEditing={'comment-editing'}
        value={this.state.comment}
        change={this.change.bind(this)}
        propName={'comment'}/>;
    }

    let modified = <span>, modified {(this.state.updatedBy !== this.state.createdBy) ? `by ${this.state.updatedByName || this.state.updatedBy}` : null} <TimeAgo
      date={this.state.updatedAt}/></span>;
    return (
      <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComment.bind(this)}>
        <div className={this.props.className || 'comment'}>
          <div className="comment-creator">
            <ReactPlaceholder showLoadingAnimation type='textRow' ready={this.state.ready}>
              <div>{this.state.createdBy ? `${this.state.createdByName || this.state.createdBy}, ` : null}<TimeAgo
                date={this.state.createdAt}/>{this.state.createdAt !== this.state.updatedAt ? modified : null}</div>
            </ReactPlaceholder>
          </div>
          <div>
            <ReactPlaceholder showLoadingAnimation type='text' rows={2} ready={this.state.ready}>
              {commentBody}
            </ReactPlaceholder>
          </div>
        </div>
      </VisibilitySensor>
    );
  }
}

Comment.propTypes = {
  className: PropTypes.string,
  accessToken: PropTypes.string,
  commentUri: PropTypes.string,
  editComments: PropTypes.bool
};
