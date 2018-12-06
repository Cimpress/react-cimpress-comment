import {findPrincipals, getPrincipal} from 'coam-client';

const mentionsUserCache = {};

export default class MentionsClient {
    constructor(accessToken) {
        this.accessToken = accessToken.replace('Bearer ', '');
    }

    fetchMatchingMentions(query) {
        return findPrincipals(this.accessToken, query)
            .then((principals) => {
                return principals.reduce((result, p) => {
                    const profile = p.profiles[0] || {};
                    if (!p.canonical_principal.endsWith('@clients')) {
                        result.push({
                            id: profile.user_id || p.canonical_principal,
                            display: profile.name || profile.email || p.canonical_principal,
                            email: profile.name ? profile.email || p.canonical_principal : null});
                    }
                    return result;
                }, []);
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
                throw new Error(`Unable to fetch principals for query: ${query}`);
            });
    }

    fetchUserName(userId) {
        if (mentionsUserCache[userId]) {
            return mentionsUserCache[userId];
        }

        let promiseToGetUser = getPrincipal(this.accessToken, userId)
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error(err);
                throw err;
            });

        mentionsUserCache[userId] = promiseToGetUser;

        return promiseToGetUser;
    }
}
