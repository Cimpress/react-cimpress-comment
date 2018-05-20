import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import {Drawer} from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';

import './i18n';
import {Trans, translate} from 'react-i18next';

class _CommentsDrawerLink extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            commentsDrawerOpen: props.opened || false,
            availableComments: null,
            opacity: 0,
            isVisible: false
        };
        props.i18n.changeLanguage(props.locale);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.locale !== newProps.locale) {
            newProps.i18n.changeLanguage(newProps.locale);
        }

        if ( newProps.resourceUri !== this.props.resourceUri ) {
            this.setState({
                opacity: 0
            });
        }
        if ( newProps.opened !== this.props.opened ) {
            this.setState({
                commentsDrawerOpen: newProps.opened
            })
        }
    }

    updateCommentCount(commentCount) {
        this.setState({
            availableComments: commentCount === 0
                ? null
                : commentCount,
            opacity: commentCount === 0
                ? 0
                : 1
        });
    }

    defaultFooter() {
        return <div className="text-right">
            <button className="btn btn-default" onClick={() => this.setState({commentsDrawerOpen: false})}>
                <i className="fa fa-times" aria-hidden="true"></i>&nbsp;<Trans>btn_close</Trans>
            </button>
        </div>;
    }

    defaultHeader() {
        return <Trans>header_comments</Trans>;
    }

    render() {
        let comments;
        if ( this.state.isVisible ) {
            comments = <Comments {...this.props} commentCountRefreshed={this.updateCommentCount.bind(this)}/>
        }

        return (
            <VisibilitySensor
                onChange={(visible) => {
                    if ( visible && this.state.isVisible !== visible ) {
                        this.setState({isVisible: visible})
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
            <span key="test" className="comment-count-badge"
                  style={{opacity: this.state.opacity}}>{this.state.availableComments}</span>
          </div>
          <Drawer
              show={this.state.commentsDrawerOpen}
              onRequestHide={() => this.setState({commentsDrawerOpen: false})}
              header={this.props.header || this.defaultHeader()}
              position={this.props.position}
              closeOnClickOutside={true}
              footer={this.props.footer || this.defaultFooter()}>
            {comments}
          </Drawer>
        </span>
            </ VisibilitySensor>
        );
    }
}

_CommentsDrawerLink.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool,
    editComments: PropTypes.bool,
    refreshInterval: PropTypes.number,
    position: PropTypes.oneOf(['left', 'right']),
    header: PropTypes.node,
    footer: PropTypes.node,
    opened: PropTypes.bool
};

_CommentsDrawerLink.defaultProps = {
    position: 'left',
    newestFirst: true,
    editComments: false,
    opened: false
};

_CommentsDrawerLink.defaultProps = {
    locale: 'eng'
};

export default translate('translations')(_CommentsDrawerLink);