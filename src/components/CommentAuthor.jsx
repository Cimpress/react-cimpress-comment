import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import {fetchUserName} from '../clients/mentions';

class CommentAuthor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        if (!this.state.createdByName && this.props.createdBy) {
            this.fetchUserName(this.props.createdBy, 'createdByName');
        }
    }

    fetchUserName(userId, stateToUpdate) {
        fetchUserName(this.props.accessToken, userId)
            .then((responseJson) => {
                if (!responseJson || !responseJson.profile) {
                  return;
                }

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
        let name = `${this.state.createdByName || this.props.createdBy}`;
        return <span className={this.props.className}>{name}</span>;
    }
}

CommentAuthor.propTypes = {
    className: PropTypes.string,
    locale: PropTypes.string,
    accessToken: PropTypes.string,
    createdBy: PropTypes.string,
};

CommentAuthor.defaultProps = {
    locale: 'eng',
    className: 'comment-author',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentAuthor);
