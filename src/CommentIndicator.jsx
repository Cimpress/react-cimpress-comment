import React from 'react';
import PropTypes from 'prop-types';

import '../style/index.css';

import {Tooltip} from '@cimpress/react-components';

import CommentsClient from './clients/CommentsClient';

import {getI18nInstance} from './tools/i18n';
import {translate} from 'react-i18next';

class CommentIndicator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            commentCount: 0,
            unreadCommentCount: 0,
            fetchingComments: false,
            fetchingUnreadComments: false,
            failedFetchingComments: false,
            failedFetchingUnreadComments: false,
            errorFetchingComments: null,
            errorFetchingUnreadComments: null,
        };
    }

    get hasComments() {
        return this.state.commentCount > 0 || this.state.unreadCommentCount > 0;
    }

    get fetching() {
        return this.state.fetchingComments || this.state.fetchingUnreadComments;
    }

    get failedFetching() {
        return this.state.failedFetchingComments || this.state.failedFetchingUnreadComments;
    }

    get errorFetching() {
        return this.state.errorFetchingComments || this.state.errorFetchingUnreadComments;
    }

    componentDidMount() {
        this._ismounted = true;
        this.init();
        this.fetchCommentCount();
        this.fetchUnreadCommentCount();
    }

    componentDidUpdate(prevProps) {
        if (this.props.resourceUri !== prevProps.resourceUri || this.props.accessToken !== prevProps.accessToken) {
            this.fetchCommentCount();
            this.fetchUnreadCommentCount();
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
        clearInterval(this._refreshIntervalHandle);
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    init() {
        clearInterval(this._refreshIntervalHandle);
        this._refreshIntervalHandle = setInterval(() => {
            this.fetchCommentCount();
            this.fetchUnreadCommentCount();
        }, Math.max((this.props.refreshInterval || 60) * 1000, 5000));
    }

    fetchCommentCount() {
        if (!this.props.accessToken) {
            return;
        }

        let client = new CommentsClient(this.props.accessToken, this.props.resourceUri);

        this.safeSetState({
            fetchingComments: true,
        }, () => client
            .fetchComments()
            .then(({responseJson}) => {
                this.safeSetState({
                    fetchingComments: false,
                    commentCount: responseJson.length,
                    failedFetchingComments: false,
                    errorFetchingComments: null,
                });
            })
            .catch((err) => {
                this.safeSetState({
                    fetchingComments: false,
                    failedFetchingComments: true,
                    errorFetchingComments: err,
                });
            }));
    }

    fetchUnreadCommentCount() {
        if (!this.props.accessToken) {
            return;
        }

        let client = new CommentsClient(this.props.accessToken, this.props.resourceUri);

        this.safeSetState({
            fetchingUnreadComments: true,
        }, () => client
            .getUserInfo()
            .then(({unreadCount}) => {
                this.safeSetState({
                    fetchingUnreadComments: false,
                    unreadCommentCount: unreadCount,
                    failedFetchingUnreadComments: false,
                    errorFetchingUnreadComments: null,
                });
            })
            .catch((err) => {
                this.safeSetState({
                    fetchingUnreadComments: false,
                    failedFetchingUnreadComments: true,
                    errorFetchingUnreadComments: err,
                });
            }));
    }

    onClick(e) {
        e.preventDefault();

        if (this.props.onClick) {
            this.props.onClick({
                resourceUri: this.props.resourceUri,
            });
        }
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        let {t, locale} = this.props;
        if (locale.length > 2) {
            locale = locale.substr(0, 2);
        }
        return t(key, {lng: locale});
    }

    wrapInErrorTooltip(error, content) {
        let errorDetails = error && error.message
            ? (<span>
                  Error details: <br/>
                {error.message}
            </span>)
            : null;

        let label = (
            <span>
                {this.tt('unable_to_retrieve_comments')}<br/>
                {errorDetails}
            </span>
        );

        return (
            <Tooltip
                direction="right"
                contents={label}
                className="rcc-tooltip-wide">
                {content}
            </Tooltip>
        );
    }

    renderError(error) {
        let content = (
            <div className="comment-drawer-button">
                <span style={{position: 'absolute', color: 'red'}} className="fa fa-times"/>
                <span className="fa fa-comments-o"/>
            </div>
        );

        return this.wrapInErrorTooltip(error, content);
    }

    render() {
        if (!this.props.resourceUri) {
            return this.renderError(new Error(this.tt('incorrect_component_setup')));
        }

        if (!this.hasComments) {
            return null;
        }

        let items = null;
        if (this.fetching) {
            items = <i className={'fa fa-spinner fa-spin'}/>;
        } else if (this.state.unreadCommentCount > 0) {
            items = this.state.unreadCommentCount;
        }

        let badge = items
            ? (
                <span className={`comment-count-badge ${this.state.fetchingData ? 'comment-count-badge-loading' : ''}`}>
                    {items}
                </span>
            )
            : null;


        return (
            <div className="comment-indicator">
                <span className="fa fa-comments-o" onClick={this.onClick.bind(this)}/>
                {badge}
            </div>
        );
    }
}

CommentIndicator.propTypes = {
    locale: PropTypes.string,
    accessToken: PropTypes.string.isRequired,
    resourceUri: PropTypes.string.isRequired,

    refreshInterval: PropTypes.number,

    onClick: PropTypes.func,
};

CommentIndicator.defaultProps = {
    locale: 'en',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentIndicator);
