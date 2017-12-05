import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import { RIETextArea } from 'riek';
import PropTypes from 'prop-types';
import '../style/index.css';
import TimeAgo from 'react-timeago';

if (!global.globalNameCache) {
  global.globalNameCache = {};
}

export default class _Comment extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      comment: (props.comment) ? props.comment.comment : '',
      createdBy: (props.comment) ? props.comment.createdBy : '',
      createdByName: (props.comment) ? global.globalNameCache[props.comment.createdBy] : null,
      createdAt: (props.comment) ? props.comment.createdAt : '',
      updatedBy: (props.comment) ? props.comment.updatedBy : '',
      updatedByName: (props.comment) ? global.globalNameCache[props.comment.updatedBy] : null,
      updatedAt: (props.comment) ? props.comment.updatedAt : '',
      visible: false,
      ready: props.comment != null
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.commentUri !== this.props.commentUri) {
      this.setState({
        comment: (newProps.comment) ? newProps.comment.comment : '',
        createdBy: (newProps.comment) ? newProps.comment.createdBy : '',
        createdAt: (newProps.comment) ? newProps.comment.createdAt : '',
        updatedBy: (newProps.comment) ? newProps.comment.updatedBy : '',
        updatedAt: (newProps.comment) ? newProps.comment.updatedAt : '',
        updatedByName: (newProps.comment) ? global.globalNameCache[newProps.comment.updatedBy] : null,
        createdByName: (newProps.comment) ? global.globalNameCache[newProps.comment.createdBy] : null,
        ready: newProps.comment != null,
      }, () => this.fetchComment(this.state.visible));
    }
  }

  fetchUserName (userId, stateToUpdate) {
    let url = `https://api.cimpress.io/auth/access-management/v1/principals/${userId}`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.props.accessToken}`);
    let init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    if (global.globalNameCache[userId]) {
        this.setState({
          [stateToUpdate]: global.globalNameCache[userId]
        });
    }
    return fetch(url, init).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(response.status);
    }).then((responseJson) => {
      globalNameCache[userId] = responseJson.profile.name;
      this.setState({
        [stateToUpdate]: responseJson.profile.name
      });
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
          updatedByName: global.globalNameCache[responseJson.updatedBy],
          createdByName: global.globalNameCache[responseJson.createdBy],
          ready: true
        });
        if (responseJson.updatedBy) {
          this.fetchUserName(responseJson.updatedBy, "updatedByName");
        }
        if (responseJson.createdBy) {
          this.fetchUserName(responseJson.createdBy, "createdByName");
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }

  change (e) {
    this.putComment(e.comment).then(() => this.setState({
      comment: responseJson.comment,
      updatedBy: responseJson.updatedBy,
      createdBy: responseJson.createdBy,
      createdAt: responseJson.createdAt,
      updatedAt: responseJson.updatedAt,
    })).catch(err => {
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
            <ReactPlaceholder showLoadingAnimation type='text' rows={1} ready={this.state.ready}>
              {commentBody}
            </ReactPlaceholder>
          </div>
        </div>
      </VisibilitySensor>
    );
  }
}

_Comment.propTypes = {
  className: PropTypes.string,
  accessToken: PropTypes.string,
  commentUri: PropTypes.string,
  comment: PropTypes.object,
  editComments: PropTypes.bool
};
