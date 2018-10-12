import React from 'react';
import auth from './auth';

import './Authenticated.css';

export default class Authenticated extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        auth.fastSafeTokenAccess().then((token) => this.setState({token: token}));
    }

    render() {
        if (!this.state.token) {
            return 'Loading...';
        }
        let profile = auth.getProfile();


        return <div>
            <div className={'active-user-box'}>
                <em className={'text-muted'}>{profile.name} ({profile.email})</em>
            </div>
            {
                // eslint-disable-next-line react/prop-types
                React.Children.map(this.props.children, (child) => React.cloneElement(child, {accessToken: this.state.token}))
            }
        </div>;
    }
}
