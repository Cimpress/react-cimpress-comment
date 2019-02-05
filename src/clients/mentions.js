import {findPrincipals, getPrincipal} from 'coam-client';
import debounce from 'debounce-promise';

const mentionsUserCache = {};

const _fetchMatchingMentions = (accessToken, query) => {
    return findPrincipals(accessToken, query)
        .then((principals) => {
            return principals.reduce((result, p) => {
                const profile = p.profiles[0] || {};
                if (!p.canonical_principal.endsWith('@clients')) {
                    result.push({
                        id: profile.user_id || p.canonical_principal,
                        display: profile.name || profile.email || p.canonical_principal,
                        email: profile.email ? profile.email || p.canonical_principal : null});
                }
                return result;
            }, []);
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            return Promise.reject(new Error(`Unable to fetch principals for query: ${query}`));
        });
};

const fetchMatchingMentions = debounce(_fetchMatchingMentions, 300);

const fetchUserName = (accessToken, userId) => {
    if (mentionsUserCache[userId]) {
        return mentionsUserCache[userId];
    }

    let promiseToGetUser = getPrincipal(accessToken, userId)
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            mentionsUserCache[userId] = null;
            throw err;
        });

    mentionsUserCache[userId] = promiseToGetUser;

    return promiseToGetUser;
};


export {
    fetchMatchingMentions,
    fetchUserName,
};
