import React from 'react';
import '../style/index.css';
import {Drawer} from '@cimpress/react-components';
import Comments from './Comments';
import PropTypes from 'prop-types';
import {Portal} from 'react-portal';

import {getI18nInstance} from './tools/i18n';
import {translate} from 'react-i18next';
import CommentsClient from './clients/CommentsClient';

class CommentsDrawerLink extends React.Component {
    constructor(props) {
        super(props);
        this.escFunction = this.escFunction.bind(this);
        this.state = {
            commentsDrawerOpen: props.opened || false,
            unreadCommentsCount: null,
        };
    }

    escFunction(event) {
        if (event.keyCode === 27) {
            this.safeSetState({
                commentsDrawerOpen: false,
            });
        }
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentDidMount() {
        this._ismounted = true;
        document.addEventListener('keydown', this.escFunction, false);
        this.fetchUnreadCount();
    }

    componentWillUnmount() {
        this._ismounted = false;
        document.removeEventListener('keydown', this.escFunction, false);
    }

    fetchUnreadCount() {
        if (!this.props.accessToken) {
            return;
        }

        let client = new CommentsClient(this.props.accessToken, this.props.resourceUri);
        this.safeSetState({
            fetchingData: true,
        }, () => client
            .getUserInfo()
            .then((data) => {
                this.safeSetState({
                    fetchingData: false,
                    unreadCommentsCount: data.unreadCount,
                });
            })
            .catch((err) => {
                this.safeSetState({
                    fetchingData: false,
                    unreadCommentsCount: '?',
                });
            }));
    }

    componentDidUpdate(prevProps) {
        if (this.props.resourceUri !== prevProps.resourceUri || this.props.accessToken !== prevProps.accessToken) {
            this.fetchUnreadCount();
        }
        if (prevProps.opened !== this.props.opened) {
            this.safeSetState({
                commentsDrawerOpen: this.props.opened,
            });
        }
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    defaultFooter() {
        return <div className="text-right">
            <button className="btn btn-default" onClick={() => this.onDrawerClose()}>
                <i className="fa fa-times" aria-hidden="true"></i>&nbsp;{this.tt('btn_close')}
            </button>
        </div>;
    }

    defaultHeader() {
        return this.tt('header_comments');
    }

    getUnreadComments() {
        let items;
        if (this.state.fetchingData) {
            items = <i className={'fa fa-spinner fa-spin'}/>;
        } else {
            items = this.state.unreadCommentsCount;
        }

        if (!this.state.fetchingData && this.state.unreadCommentsCount === 0) {
            return null;
        }

        return <span className={`comment-count-badge ${this.state.fetchingData ? 'comment-count-badge-loading' : ''}`}>
            {items}
        </span>;
    }

    onDrawerOpen() {
        this.safeSetState({commentsDrawerOpen: true});
    }

    onDrawerClose() {
        this.safeSetState({commentsDrawerOpen: false}, () => this.fetchUnreadCount());
    }

    render() {
        return [
            <div key={0} className="comment-drawer-button">
                <span className="fa fa-comments-o" onClick={() => this.onDrawerOpen()}/>
                {this.getUnreadComments()}
            </div>,
            <Portal key={1}>
                <Drawer
                    show={this.state.commentsDrawerOpen}
                    onRequestHide={() => this.onDrawerClose()}
                    header={this.props.header || this.defaultHeader()}
                    position={this.props.position}
                    closeOnClickOutside={true}
                    footer={this.props.footer || this.defaultFooter()}>
                    {this.state.commentsDrawerOpen ? <Comments {...this.props} /> : null}
                </Drawer>
            </Portal>,
        ];
    }
}

CommentsDrawerLink.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,
    newestFirst: PropTypes.bool,
    editComments: PropTypes.bool,
    deleteComments: PropTypes.bool,
    refreshInterval: PropTypes.number,
    position: PropTypes.oneOf(['left', 'right']),
    header: PropTypes.node,
    footer: PropTypes.node,
    opened: PropTypes.bool,
};

CommentsDrawerLink.defaultProps = {
    position: 'left',
    newestFirst: true,
    editComments: false,
    deleteComments: false,
    opened: false,
};

CommentsDrawerLink.defaultProps = {
    locale: 'eng',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentsDrawerLink);
