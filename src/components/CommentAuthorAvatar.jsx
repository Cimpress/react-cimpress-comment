import React from 'react';
import PropTypes from 'prop-types';

import '../../style/index.css';
import '../../style/select.css';

import {getI18nInstance} from '../tools/i18n';
import {translate} from 'react-i18next';

import {fetchUserName} from '../clients/mentions';
import UserAvatar from 'react-user-avatar';
import '../../style/avatar.css';

class CommentAuthorAvatar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            avatar: null,
            name: ' ',
        };
    }

    componentDidMount() {
        this._ismounted = true;
        fetchUserName(this.props.accessToken, this.props.userId)
            .then((responseJson) => {
                if (!responseJson || !responseJson.profile) {
                    return this.safeSetState({
                        name: this.props.userId,
                    });
                }

                this.safeSetState({
                    avatar: responseJson.profile.picture,
                    name: responseJson.profile.name,
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
        return <UserAvatar src={this.state.avatar} size={48} name={this.state.name}
            colors={['#0088a9']}/>;
    }
}

CommentAuthorAvatar.propTypes = {
    accessToken: PropTypes.string,
    userId: PropTypes.string,
};


export default translate('translations', {i18n: getI18nInstance()})(CommentAuthorAvatar);
