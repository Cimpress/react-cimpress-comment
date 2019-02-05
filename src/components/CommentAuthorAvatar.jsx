import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import {fetchUserName} from '../clients/mentions';

class CommentAuthorAvatar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            avatar: null,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        fetchUserName(this.props.accessToken, this.props.userId)
            .then((responseJson) => {
                this.safeSetState({
                    avatar: responseJson.profile.picture,
                });
            });
    }

    safeSetState(data, callback) {
        if (this._ismounted) {
            this.setState(data, callback);
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    render() {
        return (this.state.avatar)
            ? <img src={this.state.avatar} alt="" className={this.props.className}/>
            : null;
    }
}

CommentAuthorAvatar.propTypes = {
    className: PropTypes.string,
    accessToken: PropTypes.string,
    userId: PropTypes.string,
};

CommentAuthorAvatar.defaultProps = {
    className: 'comment-author-avatar',
};

export default translate('translations', {i18n: getI18nInstance()})(CommentAuthorAvatar);
