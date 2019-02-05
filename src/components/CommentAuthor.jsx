import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import TimeAgo from 'react-timeago';
import {reactTimeAgoFormatters} from '../locales/reactTimeAgoFormatters';
import {fetchUserName} from '../clients/mentions';

class CommentAuthor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            updatedByName: null,
            createdByName: null,
        };
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentDidMount() {
        this._ismounted = true;
        this.fetchUserNames();
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentDidUpdate() {
        this.fetchUserNames();
    }

    fetchUserNames() {
        if (!this.state.updatedByName && this.props.updatedBy) {
            this.fetchUserName(this.props.updatedBy, 'updatedByName');
        }
        if (!this.state.createdByName && this.props.createdBy) {
            this.fetchUserName(this.props.createdBy, 'createdByName');
        }
    }

    fetchUserName(userId, stateToUpdate) {
        fetchUserName(this.props.accessToken, userId)
            .then((responseJson) => {
                this.safeSetState({
                    [stateToUpdate]: responseJson.profile.name,
                });
            });
    }

    tt(key) {
        // eslint-disable-next-line react/prop-types
        const {t, locale} = this.props;
        return t(key, {lng: locale});
    }

    render() {
        let name = null;
        if (this.props.previousCreatedBy !== this.props.createdBy) {
            name = `${this.state.createdByName || this.props.createdBy}`;
        }
        return <span className={this.props.className}>
            {name}
            {this.props.createdAt ?
                <React.Fragment>
                    <span>,&nbsp;</span>
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
        </span>;
    }
}

CommentAuthor.propTypes = {
    className: PropTypes.string,
    locale: PropTypes.string,
    accessToken: PropTypes.string,
    createdBy: PropTypes.string,
    createdAt: PropTypes.string,
    updatedBy: PropTypes.string,
    updatedAt: PropTypes.string,
    previousCreatedBy: PropTypes.string,
};

CommentAuthor.defaultProps = {
    locale: 'eng',
    className: 'comment-creator',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentAuthor);
