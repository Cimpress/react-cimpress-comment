import React, { Component } from 'react';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import { Drawer } from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';

export default class _CommentsDrawerLink extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      commentsDrawerOpen: false,
      availableComments: null,
      opacity: 0
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.resourceUri !== this.props.resourceUri) {
      this.setState({
        opacity: 0
      });
    }
  }

  updateCommentCount (commentCount) {
    this.setState({
      availableComments: commentCount === 0 ? null : commentCount,
      opacity: commentCount === 0 ? 0 : 1
    });
  }

  render () {
    return (
      <span>
        <div className="comment-drawer-button">
          <a href="#">
            <span className="fa fa-comments-o"
                  onClick={() => this.setState({
                    commentsDrawerOpen: true
                  })}/>
            <span key="test" className="comment-count-badge" style={{opacity: this.state.opacity}}>{this.state.availableComments}</span>
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
        <Comments {...this.props} commentCountRefreshed={this.updateCommentCount.bind(this)}/>
        </Drawer>
      </span>
    );
  }
}

_CommentsDrawerLink.propTypes = {
  accessToken: PropTypes.string.isRequired,
  resourceUri: PropTypes.string.isRequired,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool,
  refreshInterval: PropTypes.number,
};