import {findPrincipals, getPrincipal} from 'coam-client';

const mentionsUserCache = {};

const fetchMatchingMentions = (accessToken, query) => {
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
            throw new Error(`Unable to fetch principals for query: ${query}`);
        });
};

const fetchUserName = (accessToken, userId) => {
    if (mentionsUserCache[userId]) {
        return mentionsUserCache[userId];
    }

    let promiseToGetUser = getPrincipal(accessToken, userId)
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            throw err;
        });

    mentionsUserCache[userId] = promiseToGetUser;

    return promiseToGetUser;
};


export {
    fetchMatchingMentions,
    fetchUserName,
};