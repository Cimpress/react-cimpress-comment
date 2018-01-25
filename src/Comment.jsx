import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import { RIETextArea } from 'riek';
import PropTypes from 'prop-types';
import '../style/index.css';
import TimeAgo from 'react-timeago';
import CommentClient from './CommentClient';
import { getSubFromJWT } from './helper';

let globalCacheKey = Symbol();
let globalCache = {};

export default class _Comment extends React.Component {

  constructor (props) {
    super(props);
    this.commentClient = new CommentClient(props.accessToken, props.commentUri);
    this.state = {
      comment: (props.comment) ? props.comment.comment : '',
      createdBy: (props.comment) ? props.comment.createdBy : '',
      createdByName: (props.comment) ? this[globalCacheKey][props.comment.createdBy] : null,
      createdAt: (props.comment) ? props.comment.createdAt : '',
      updatedBy: (props.comment) ? props.comment.updatedBy : '',
      updatedByName: (props.comment) ? this[globalCacheKey][props.comment.updatedBy] : null,
      updatedAt: (props.comment) ? props.comment.updatedAt : '',
      visible: false,
      ready: props.comment != null
    };
  }

  get [globalCacheKey]() {
    return globalCache;
  }

  componentWillReceiveProps (newProps) {
    this.commentClient = new CommentClient(newProps.accessToken, newProps.commentUri);
    if (newProps.commentUri !== this.props.commentUri) {
      this.setState({
        comment: (newProps.comment) ? newProps.comment.comment : '',
        createdBy: (newProps.comment) ? newProps.comment.createdBy : '',
        createdAt: (newProps.comment) ? newProps.comment.createdAt : '',
        updatedBy: (newProps.comment) ? newProps.comment.updatedBy : '',
        updatedAt: (newProps.comment) ? newProps.comment.updatedAt : '',
        updatedByName: (newProps.comment) ? this[globalCacheKey][newProps.comment.updatedBy] : null,
        createdByName: (newProps.comment) ? this[globalCacheKey][newProps.comment.createdBy] : null,
        ready: newProps.comment != null
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
    if (this[globalCacheKey][userId]) {
      this.setState({
        [stateToUpdate]: this[globalCacheKey][userId]
      });
    }
    return fetch(url, init).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(response.status);
    }).then((responseJson) => {
      this[globalCacheKey][userId] = responseJson.profile.name;
      this.setState({
        [stateToUpdate]: responseJson.profile.name
      });
    }).catch(err => {
      console.log(err);
    });
  }

  putComment (comment) {
    return this.commentClient.putComment(comment);
  }

  fetchComment (isVisible) {
    this.setState({
      visible: isVisible
    });
    if (isVisible) {
      return this.commentClient.fetchComment().then(responseJson => {
        this.setState({
          comment: responseJson.comment,
          updatedBy: responseJson.updatedBy,
          createdBy: responseJson.createdBy,
          createdAt: responseJson.createdAt,
          updatedAt: responseJson.updatedAt,
          updatedByName: this[globalCacheKey][responseJson.updatedBy],
          createdByName: this[globalCacheKey][responseJson.createdBy],
          ready: true
        });
        if (responseJson.updatedBy) {
          this.fetchUserName(responseJson.updatedBy, 'updatedByName');
        }
        if (responseJson.createdBy) {
          this.fetchUserName(responseJson.createdBy, 'createdByName');
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }

  change (e) {
    this.putComment(e.comment).then((responseJson) => this.setState({
          comment: responseJson.comment,
          updatedBy: responseJson.updatedBy,
          createdBy: responseJson.createdBy,
          createdAt: responseJson.createdAt,
          updatedAt: responseJson.updatedAt
        })
    ).catch(err => {
      console.log(err);
    });
  }

  render () {
    let commentBody = <span>{this.state.comment}</span>;
    let jwtSub = getSubFromJWT(this.props.accessToken);
    if (this.props.editComments === true && (this.state.createdBy === jwtSub || this.state.updatedBy === jwtSub)) {
      commentBody = <RIETextArea
        editProps={{ onKeyDown: function (e) { if (e.key === "Enter" && e.shiftKey === false) e.target.blur() }}}
        classEditing={'comment-editing'}
        value={this.state.comment}
        change={this.change.bind(this)}
        propName={'comment'}
        className={"comment-editable"}
      />;
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
