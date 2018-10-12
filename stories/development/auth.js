import SsoAuth from 'auth0-sso-login';
import jwtDecode from 'jwt-decode';
import * as url from 'url';
import * as querystring from 'querystring';

const CLIENT_ID = 'Wtq3wMftZJJWykxb0zuAGEfOqW7NG6vz';

class Auth {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.profile = JSON.parse(localStorage.getItem('profile'));

        this.ssoAuth = new SsoAuth({
            domain: 'cimpress.auth0.com',
            audience: 'https://api.cimpress.io/',
            clientId: CLIENT_ID,
            logoutRedirectUri: window.location.origin,
            hooks: {
                profileRefreshed: (value) => {
                    this.profile = value;
                    localStorage.setItem('profile', JSON.stringify(this.profile));
                },
                tokenRefreshed: () => {
                    this.accessToken = this.ssoAuth.getIdToken();
                    localStorage.setItem('accessToken', this.accessToken);
                },
            },
        });
    }

    getUserId() {
        let t = this.getAccessToken();
        if (t) {
            return JSON.parse(atob(t.split('.')[1])).sub;
        }
        return null;
    }

    getAccessToken() {
        // actually returns an access token
        return this.accessToken;
    }

    fastSafeTokenAccess() {
        let accessToken = this.getAccessToken();
        if (accessToken && this.isValidToken(accessToken)) {
            return Promise.resolve(accessToken);
        }

        return this.login()
            .then(() => this.getAccessToken())
            .catch(() => null);
    }

    getProfile() {
        return this.profile;
    }

    /**
     * @description Check if user is logged in
     * @return {bool} Whether the user is logged in or not
     */
    isLoggedIn() {
        let accessToken = this.ssoAuth.getIdToken();
        if (accessToken) {
            let decodedToken = jwtDecode(accessToken);
            accessToken = decodedToken.exp > (Date.now() / 1000)
                ? accessToken
                : null;
        }
        return !!accessToken;
    }

    isValidToken(accessToken) {
        let isValid = false;
        if (accessToken) {
            try {
                let decodedToken = jwtDecode(accessToken);
                isValid = decodedToken.exp > (Date.now() / 1000)
                    ? accessToken
                    : null;
            } catch (e) {
                return false;
            }
        }
        return isValid;
    }

    login(nextUrl, forceTokenRefresh = false) {
        // ensure that requests to subpages are not lost if a redirection to root was already scheduled during a previous visit
        if (localStorage.getItem('redirectUri') === window.location.origin + '/') {
            localStorage.removeItem('redirectUri');
        }

        const extraConfiguration = {
            enabledHostedLogin: true,
            forceTokenRefresh: forceTokenRefresh,
            redirectUri: window.location.href,
        };

        return this.ssoAuth.ensureLoggedIn(extraConfiguration)
            .then(() => {
                if (!this.isLoggedIn()) {
                    throw new Error('Authentication unsuccessful.');
                }
                // if a redirect didn't fire after logging in (e.g., because we blocked
                // the redirect to root), we might need to manually remove Auth0 state
                // from the query string
                let currentUrl = url.parse(window.location.href);
                let qs = querystring.parse(currentUrl.search);
                if (qs.code || qs.state) {
                    delete qs.code;
                    delete qs.state;
                    currentUrl.search = querystring.stringify(qs);
                    window.location.href = window.location.origin
                        + window.location.pathname + currentUrl.search;
                }
            });
    }

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('profile');
        delete this.profile;
        delete this.accessToken;
        return Promise.resolve(this.ssoAuth.logout());
    }
}

const auth = new Auth();

global.auth = auth;

export default auth;
