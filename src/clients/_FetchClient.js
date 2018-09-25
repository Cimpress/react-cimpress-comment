const version = require('../../package.json').version;

export default class _FetchClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    getDefaultConfig(method, jsonPayload) {
        let headers = new Headers();
        headers.append('Authorization', `Bearer ${this.accessToken}`);
        if (method !== 'GET') {
            headers.append('Content-Type', 'application/json');
            headers.append('Comments-Component-Version', version);
        }

        let config = {
            method: method,
            headers: headers,
            mode: 'cors',
            cache: 'default',
            retries: 3,
            retryDela: 500,
            retryOn: [429, 500, 502, 503],
        };

        if (jsonPayload) {
            config.body = JSON.stringify(jsonPayload);
        }

        return config;
    }
}
