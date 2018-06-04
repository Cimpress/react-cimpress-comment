"use strict";

const jwt = require("jsonwebtoken");
const rp = require("request-promise-native");

const defaultConfig = {
    domain: "cimpress.auth0.com",
    audience: "https://api.cimpress.io/"
};

class Auth0Authenticator {

    constructor(clientId, clientSecret, config) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;

        this.config = Object.assign({}, defaultConfig, (config || {}));
    }

    async getAccessToken() {

        if ( this._isValidToken() ) {
            return this._token;
        }

        let options = {
            method: "POST",
            uri: `https://${this.config.domain}/oauth/token`,
            body: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                audience: this.config.audience,
                grant_type: "client_credentials"
            },
            json: true
        };

        let parsedBody = await rp(options);

        this._token = parsedBody.access_token;

        return this._token;
    }

    _isValidToken() {
        if ( !this._token ) {
            return false;
        }

        let exp = jwt.decode(this._token).exp;

        return exp && exp < (new Date().getTime() / 1000)
    }
}

module.exports = Auth0Authenticator;