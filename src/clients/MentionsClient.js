import _FetchClient from './_FetchClient';
import {findPrincipals, getPrincipal} from 'coam-client';

const mentionsUserCache = {};

export default class MentionsClient extends _FetchClient {
    constructor(accessToken) {
        super(accessToken.replace('Bearer ', ''));
    }

    fetchMatchingMentions(query) {
        return findPrincipals(this.accessToken, query)
            .then((principals) => {
                return principals.reduce((result, p) => {
                    const profile = p.profiles[0] || {};
                    if(!p.canonical_principal.endsWith('@clients')){
                        result.push({
                            id: profile.user_id || p.canonical_principal, 
                            display: profile.name || p.canonical_principal, 
                            email: profile.email || p.canonical_principal})
                    }
                    return result;
                },[]);
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
