import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import {getPrincipalMemoized} from '../clients/mentions';

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
        this.fetchCreatedByName();
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.accessToken
            && (prevProps.accessToken !== this.props.accessToken
                || prevProps.createdBy !== this.props.createdBy)) {
            this.fetchCreatedByName();
        }
    }

    fetchCreatedByName() {
        if (this.props.createdBy) {
            getPrincipalMemoized(this.props.accessToken, this.props.createdBy)
                .then((responseJson) => {
                    if (responseJson && responseJson.profile && responseJson.profile.name) {
                        this.safeSetState({
                            createdByName: responseJson.profile.name,
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
    locale: 'en',
    className: 'comment-author',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentAuthor);
