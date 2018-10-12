import _FetchClient from './_FetchClient';

const mentionsUserCache = {};

export default class MentionsClient extends _FetchClient {
    constructor(accessToken) {
        super(accessToken);
    }

    fetchMatchingMentions(query) {
        if (!query || query.length === 0) {
            return Promise.resolve([]);
        }

        let url = `https://api.cimpress.io/auth/access-management/v1/principals?q=${query}`;
        let init = this.getDefaultConfig('GET');

        return fetch(url, init)
            .then((response) => {
                if (response.status === 200) {
                    return response.json().then((responseJson) => responseJson.principals.map((p) => {
                        return {id: p.user_id, display: p.name, email: p.email};
                    }));
                } else {
                    throw new Error(`Unable to fetch principals for query: ${query}`);
                }
            });
    }

    fetchUserName(userId) {
        if (mentionsUserCache[userId]) {
            return mentionsUserCache[userId];
        }

        let url = `https://api.cimpress.io/auth/access-management/v1/principals/${userId}`;
        let init = this.getDefaultConfig('GET');

        let promiseToGetUser = fetch(url, init)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                throw new Error(response.status);
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
            });

        mentionsUserCache[userId] = promiseToGetUser;

        return promiseToGetUser;
    }
}
