export default class FetchClient {

    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    getDefaultConfig(method, jsonPayload) {

        let headers = new Headers();
        headers.append('Authorization', `Bearer ${this.accessToken}`);
        if (method !== 'GET') {
            headers.append('Content-Type', 'application/json');
        }

        let config = {
            method: method,
            headers: headers,
            mode: 'cors',
            cache: 'default'
        };

        if ( jsonPayload ) {
            config.body = JSON.stringify(jsonPayload);
        }

        return config;
    }

}
