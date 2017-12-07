import React, { Component } from 'react';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import { Drawer } from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';
import CommentsClient from './CommentsClient';

export default class _CommentsDrawerLink extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = 'https://comment.staging.trdlnk.cimpress.io';
    this.commentsClient = new CommentsClient(props.accessToken, props.resourceUri);
    this.state = {
      commentsDrawerOpen: false,
      availableComments: 0
    };
    this.reloadCommentCount();
  }

  componentWillReceiveProps (newProps) {
    this.commentsClient = new CommentsClient(newProps.accessToken, newProps.resourceUri);
    this.reloadCommentCount();
  }

  reloadCommentCount () {
    this.commentsClient.fetchComments().then(comments => this.setState({
      availableComments: comments ? comments.length : 0
    })).catch(() => this.setState({
      availableComments: 0
    }));
  }

  render () {
    let badge = <span className="comment-count-badge">{this.state.availableComments}</span>;

    return (
      <span>
        <div className="comment-drawer-button">
          <a href="#">
          <span className="fa fa-comments-o"
                onClick={() => this.setState({
                  commentsDrawerOpen: true
                })}/>
            {this.state.availableComments > 0 ? badge : null}
          </a>
        </div>
        <Drawer
          show={this.state.commentsDrawerOpen}
          onRequestHide={() => this.setState({commentsDrawerOpen: false})}
          header="Comments"
          closeOnClickOutside={true}
          footer={<div className="text-right">
            <button className="btn btn-default" onClick={() => this.setState({commentsDrawerOpen: false})}>
              <i className="fa fa-times" aria-hidden="true"></i>&nbsp;Close
            </button>
          </div>}>
        <Comments {...this.props} onPost={this.reloadCommentCount.bind(this)}/>
        </Drawer>
      </span>
    );
  }
}

_CommentsDrawerLink.propTypes = {
  accessToken: PropTypes.string.isRequired,
  resourceUri: PropTypes.string.isRequired,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool
};