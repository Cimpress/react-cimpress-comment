import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import 'react-placeholder/lib/reactPlaceholder.css';
import '../style/index.css';
import {Drawer} from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';
import {Portal} from 'react-portal';

import {getI18nInstance} from './i18n';
import {translate} from 'react-i18next';

class _CommentsDrawerLink extends React.Component {
    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
        this.state = {
            commentsDrawerOpen: props.opened || false,
            availableComments: null,
            opacity: 0,
            isVisible: false
        };
    }

    escFunction(event){
        if(event.keyCode === 27) {
            this.setState({
              commentsDrawerOpen: false
            })
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }

    componentWillReceiveProps(newProps) {
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

    tt(key) {
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    defaultFooter() {
        return <div className="text-right">
            <button className="btn btn-default" onClick={() => this.setState({commentsDrawerOpen: false})}>
                <i className="fa fa-times" aria-hidden="true"></i>&nbsp;{this.tt('btn_close')}
            </button>
        </div>;
    }

    defaultHeader() {
        return this.tt('header_comments');
    }

    render() {
        let comments;
        if (this.state.isVisible) {
            comments = <Comments {...this.props} commentCountRefreshed={this.updateCommentCount.bind(this)}/>
        }

        return (
            <VisibilitySensor
                onChange={(visible) => {
                    if (visible && this.state.isVisible !== visible) {
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
          <Portal>
              <Drawer
                  show={this.state.commentsDrawerOpen}
                  onRequestHide={() => this.setState({commentsDrawerOpen: false})}
                  header={this.props.header || this.defaultHeader()}
                  position={this.props.position}
                  closeOnClickOutside={true}
                  footer={this.props.footer || this.defaultFooter()}>
                {comments}
              </Drawer>
          </Portal>
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

export default translate('translations', {i18n: getI18nInstance()})(_CommentsDrawerLink);
