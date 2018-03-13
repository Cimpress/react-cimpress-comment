import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import { Drawer } from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';

export default class _CommentsDrawerLink extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      commentsDrawerOpen: props.opened || false,
      availableComments: null,
      opacity: 0,
      isVisible: false
    };
  }

  componentWillReceiveProps (newProps) {
    if (newProps.resourceUri !== this.props.resourceUri) {
      this.setState({
        opacity: 0
      });
    }
    if (newProps.opened !== this.props.opened) {
      this.setState({
        commentsDrawerOpen: newProps.opened
      })
    }
  }

  updateCommentCount (commentCount) {
    this.setState({
      availableComments: commentCount === 0 ? null : commentCount,
      opacity: commentCount === 0 ? 0 : 1
    });
  }

  render () {
    let footer = (<div className="text-right">
      <button className="btn btn-default" onClick={() => this.setState({commentsDrawerOpen: false})}>
        <i className="fa fa-times" aria-hidden="true"></i>&nbsp;Close
      </button>
    </div>);
    let comments
    if (this.state.isVisible) {
      comments = <Comments {...this.props} commentCountRefreshed={this.updateCommentCount.bind(this)}/>
    }

    return (
      <VisibilitySensor
        onChange={(visible) => {
          if (visible && this.state.isVisible !== visible) {
            this.setState({ isVisible: visible })
          }
        }}
        partialVisibility
        scrollCheck>
        <span>
          <div className="comment-drawer-button">
            <span className="fa fa-comments-o"
              onClick={() => this.setState({
                commentsDrawerOpen: true
              })}/>
            <span key="test" className="comment-count-badge" style={{opacity: this.state.opacity}}>{this.state.availableComments}</span>
          </div>
          <Drawer
            show={this.state.commentsDrawerOpen}
            onRequestHide={() => this.setState({commentsDrawerOpen: false})}
            header={this.props.header ? this.props.header : 'Comments'}
            position={this.props.position === 'left' ? 'left' : 'right'}
            closeOnClickOutside={true}
            footer={this.props.footer ? this.props.footer : footer}>
            {comments}
          </Drawer>
        </span>
      </ VisibilitySensor>
    );
  }
}

_CommentsDrawerLink.propTypes = {
  accessToken: PropTypes.string.isRequired,
  resourceUri: PropTypes.string.isRequired,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool,
  refreshInterval: PropTypes.number,
  position: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  opened: PropTypes.bool
};