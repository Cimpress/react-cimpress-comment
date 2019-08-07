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
        .then(responseJson => {
            // according to https://cimpress.slack.com/archives/C5GD70W9J/p1565168815238400,
            // users invited to the platform have no "profile.name" field and instead have their
            // name information stored in user metadata. At time of writing it is filed in COAM
            // as a bug and the field may be backpopulated. Backpopulating it here in the meantime.
            if (responseJson
                && responseJson.profile
                && !responseJson.profile.name
                && responseJson.profile.user_metadata
                && (responseJson.profile.user_metadata.first_name || responseJson.profile.user_metadata.last_name)) {
                responseJson.profile.name = `${responseJson.profile.user_metadata.first_name} ${responseJson.profile.user_metadata.last_name}`;
            }
            return responseJson;
        })
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
