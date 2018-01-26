import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import ReactPlaceholder from 'react-placeholder';
import 'react-placeholder/lib/reactPlaceholder.css';
import PropTypes from 'prop-types';
import '../style/index.css';
import TimeAgo from 'react-timeago';
import CommentClient from './CommentClient';
import { getSubFromJWT } from './helper';
import { MentionsInput, Mention } from 'react-mentions';
import MentionsClient from './MentionsClient';
import { shapes } from '@cimpress/react-components';
import { TextBlock, MediaBlock, TextRow, RectShape, RoundShape } from 'react-placeholder/lib/placeholders';

let {Spinner} = shapes;

let globalCacheKey = Symbol();
let globalCache = {};

export default class _Comment extends React.Component {

  constructor (props) {
    super(props);
    this.commentClient = new CommentClient(props.accessToken, props.commentUri);
    this.mentionsClient = new MentionsClient(props.accessToken);
    this.state = {
      editMode: false,
      editedComment: null,
      savingComment: false,
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

  get [globalCacheKey] () {
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
      console.error(err);
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
        console.error(err);
      });
    }
    return Promise.resolve();
  }

  change (event, newValue, newPlainTextValue, mentions) {
    this.setState({
      editedComment: newPlainTextValue
    });
  }

  completeEditing () {
    this.setState({
      savingComment: true
    });
    if (this.state.editedComment !== null && this.state.editedComment !== this.state.comment) {
      this.putComment(this.state.editedComment.trim()).then((responseJson) => {
        this.setState({
          editedComment: null,
          editMode: false,
          savingComment: false,
          comment: responseJson.comment,
          updatedBy: responseJson.updatedBy,
          createdBy: responseJson.createdBy,
          createdAt: responseJson.createdAt,
          updatedAt: responseJson.updatedAt
        });
      });
    } else {
      this.setState({
        editedComment: null,
        editMode: false,
        savingComment: false
      });
    }
  }

  cancelEditing () {
    this.setState({
      editedComment: null,
      editMode: false
    });
    this.fetchComment(this.state.isVisible);
  }

  authorPlaceholder = (
    <div>
      <TextBlock rows={1} color='lightgray' style={{width: 30, height: 5, marginTop: 10, marginBottom: 10}}/>
    </div>
  );

  commentPlaceholder = (
    <div>
      <TextBlock rows={2} color='gray' lineSpacing={4} style={{width: 30, height: 30}}/>
    </div>
  );

  render () {
    let jwtSub = getSubFromJWT(this.props.accessToken);
    let classes = 'mentions disabled';
    let editMenu = null;
    if (this.props.editComments === true && (this.state.createdBy === jwtSub || this.state.updatedBy === jwtSub)) {
      if (this.state.savingComment === true) {
        classes = 'mentions disabled';
        editMenu = <div className={'mentions-edit'}><Spinner size={20}/></div>;
      } else if (this.state.editMode) {
        classes = 'mentions';
        let completeEdit = <div onClick={this.completeEditing.bind(this)} className={'fa fa-check mentions-ok'}/>;
        let cancelEdit = <div onClick={this.cancelEditing.bind(this)} className={'fa fa-close mentions-cancel'}/>;
        editMenu = (<div>
          {(this.state.editedComment !== null && this.state.editedComment !== this.state.comment) ? completeEdit : null}
          {cancelEdit}
        </div>);
      } else {
        editMenu = <div onClick={() => { this.setState({editMode: true});}} className={'mentions-edit fa fa-edit'}/>;
      }
    }

    let commentBody = (
      <div style={{position: 'relative'}}>
        <MentionsInput className={classes} value={this.state.editedComment || this.state.comment} onChange={this.change.bind(this)}
                       displayTransform={(id, display, type) => `@${display} `} allowSpaceInQuery={true}>
          <Mention trigger="@"
                   data={(search, callback) => { this.mentionsClient.fetchMatchingMentions(search).then(callback); }}
                   appendSpaceOnAdd={true}
          />
        </MentionsInput>
        {editMenu}
      </div>);

    let modified = <span>, modified {(this.state.updatedBy !== this.state.createdBy) ? `by ${this.state.updatedByName || this.state.updatedBy}` : null} <TimeAgo
      date={this.state.updatedAt}/></span>;
    return (
      <VisibilitySensor partialVisibility={true} scrollCheck={true} onChange={this.fetchComment.bind(this)}>
        <div className={this.props.className || 'comment'}>
          <ReactPlaceholder showLoadingAnimation customPlaceholder={this.authorPlaceholder} ready={this.state.ready}>
            <div className={'comment-creator'}>
              {this.state.createdBy ? `${this.state.createdByName || this.state.createdBy}, ` : null}
              <TimeAgo date={this.state.createdAt}/>{this.state.createdAt !== this.state.updatedAt ? modified : null}
            </div>
          </ReactPlaceholder>
          <div>
            <ReactPlaceholder showLoadingAnimation customPlaceholder={this.commentPlaceholder} ready={this.state.ready}>
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
