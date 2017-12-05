import React, { Component } from 'react';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import { Drawer } from '@cimpress/react-components';
import Comments from './Comments'
import PropTypes from 'prop-types';

export default class _CommentsDrawerLink extends React.Component {

  constructor (props) {
    super(props);
    this.commentServiceUrl = 'https://comment.staging.trdlnk.cimpress.io';
    this.state = {
      commentsDrawerOpen: false
    };
  }

  render () {
    return (
      <div>
        <div className="badgeable-content">
          <a href="#">
          <span className="fa fa-comments-o"
                onClick={() => this.setState({
                  commentsDrawerOpen: true,
                })}/>
            <span className="notify-badge">343</span>
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
          <Comments {...this.props}/>
        </Drawer>
      </div>

    );
  }
}

_CommentsDrawerLink.propTypes = {
  accessToken: PropTypes.string.isRequired,
  resourceUri: PropTypes.string.isRequired,
  newestFirst: PropTypes.bool,
  editComments: PropTypes.bool
};