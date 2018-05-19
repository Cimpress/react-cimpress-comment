"use strict";

const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const rp = require("request-promise-native");

const KMS = new AWS.KMS({region: 'eu-west-1'});

const defaultConfig = {
    domain: "cimpress.auth0.com",
    audience: "https://api.cimpress.io/"
};

class KmsBasedAuth0Authenticator {

    constructor(clientId, encryptedClientSecret, config) {
        this.clientId = clientId;
        this.encryptedClientSecret = encryptedClientSecret;
        this.decryptedClientSecret = process.env.DECRYPTED_CLIENT_SECRET;

        this.config = Object.assign({}, defaultConfig, (config || {}));
    }

    async getAccessToken() {

        if ( this._isValidToken() ) {
            return this._token;
        }

        if ( !this.decryptedClientSecret ) {
            await this._decrypt();
        }

        let options = {
            method: "POST",
            uri: `https://${this.config.domain}/oauth/token`,
            body: {
                client_id: this.clientId,
                client_secret: this.decryptedClientSecret,
                audience: this.config.audience,
                grant_type: "client_credentials"
            },
            json: true
        };

        let parsedBody = await rp(options);

        this._token = parsedBody.access_token;

        return this._token;
    }

    async _decrypt() {
        this.decryptedClientSecret = await KMS.decrypt({
            CiphertextBlob: new Buffer(this.encryptedClientSecret, "base64")
        }).promise();
    }

    _isValidToken() {
        if ( !this._token ) {
            return false;
        }

        let exp = jwt.decode(this._token).exp;

        return exp && exp < (new Date().getTime() / 1000)
    }
}

module.exports = KmsBasedAuth0Authenticator;