import FetchClient from './FetchClient';

const AUTH_SERVICE_URL = (process && process.env ? process.env.AUTH_SERVICE_URL : null) || 'https://api.cimpress.io';

export default class MentionsClient extends FetchClient {

    constructor(accessToken) {
        super(accessToken);
    }

    fetchMatchingMentions(query) {
        if ( !query || query.length == 0 ) {
            return Promise.resolve([]);
        }

        let url = `${AUTH_SERVICE_URL}/auth/access-management/v1/principals?q=${query}`;
        let init = this.getDefaultConfig('GET');

        return fetch(url, init)
            .then(response => {
                if ( response.status === 200 ) {
                    return response.json().then(responseJson => responseJson.principals.map(p => {
                        return {id: p.user_id, display: p.name, email: p.email};
                    }));
                } else {
                    throw new Error(`Unable to fetch principals for query: ${query}`);
                }
            });
    }

    fetchUserName(userId) {
        let url = `${AUTH_SERVICE_URL}/auth/access-management/v1/principals/${userId}`;
        let init = this.getDefaultConfig('GET');

        return fetch(url, init)
            .then(response => {
                if ( response.status === 200 ) {
                    return response.json();
                }
                throw new Error(response.status);
            }).catch(err => {
                console.error(err);
            });
    }
}
