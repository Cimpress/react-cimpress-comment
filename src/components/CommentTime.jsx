import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import TimeAgo from 'react-timeago';
import {reactTimeAgoFormatters} from '../locales/reactTimeAgoFormatters';
import {getPrincipalMemoized} from '../clients/mentions';

class CommentTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updatedByName: null,
        };
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentDidMount() {
        this._ismounted = true;
        this.fetchUpdatedByName();
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.accessToken
            && (prevProps.accessToken !== this.props.accessToken
                || prevProps.updatedBy !== this.props.updatedBy)) {
            this.fetchUpdatedByName();
        }
    }

    fetchUpdatedByName() {
        if (this.props.updatedBy) {
            getPrincipalMemoized(this.props.accessToken, this.props.updatedBy)
                .then((responseJson) => {
                    if (responseJson && responseJson.profile && responseJson.profile.name) {
                        this.safeSetState({
                            updatedByName: responseJson.profile.name,
                        });
                    }
                })
                .catch((err) => {
                    if (err && err.response && err.response.status != 404) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    }
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

    render() {
        return <div className={this.props.className}>
            {this.props.createdAt ?
                <React.Fragment>
                    <TimeAgo
                        date={this.props.createdAt}
                        formatter={reactTimeAgoFormatters[this.props.locale]}/>
                </React.Fragment>
                : null}
            {this.props.createdAt !== this.props.updatedAt && this.props.updatedAt
                ?
                <span>, {this.tt('modified')} {(this.props.updatedBy !== this.props.createdBy)
                    ? `${this.tt('by')} ${this.state.updatedByName || this.props.updatedBy}`
                    : null} <TimeAgo
                    date={this.props.updatedAt}
                    formatter={reactTimeAgoFormatters[this.props.locale]}/></span>
                : null}
        </div>;
    }
}

CommentTime.propTypes = {
    className: PropTypes.string,
    locale: PropTypes.string,
    accessToken: PropTypes.string,
    createdBy: PropTypes.string,
    createdAt: PropTypes.string,
    updatedBy: PropTypes.string,
    updatedAt: PropTypes.string,
};

CommentTime.defaultProps = {
    locale: 'en',
    className: 'comment-creator',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentTime);
