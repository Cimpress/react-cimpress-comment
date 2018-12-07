const fetch = require('fetch-retry');

const version = require('../../package.json').version;

export default class CommentsClient {
    constructor(accessToken, resourceUri, commentServiceUrl) {
        this.accessToken = accessToken;
        this.commentServiceUrl = commentServiceUrl || 'https://comment.trdlnk.cimpress.io';
        this.resourceUri = resourceUri;
        this.encodedResourceUri = encodeURIComponent(resourceUri);
    }

    getDefaultConfig(method, jsonPayload) {
        let headers = new Headers();
        headers.append('Authorization', `Bearer ${this.accessToken}`);
        headers.append('x-cimpress-comments-client-version', version);
        if (method !== 'GET') {
            headers.append('Content-Type', 'application/json');
        }

        return {
            method: method,
            headers: headers,
            mode: 'cors',
            cache: 'default',
            retries: 3,
            retryDela: 500,
            retryOn: [429, 500, 502, 503],
            body: jsonPayload ? JSON.stringify(jsonPayload) : undefined,
        };
    }

    getResourceUri(resourceUri) {
        if (!resourceUri) {
            return `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}`;
        }

        let encodedResourceUri = encodeURIComponent(resourceUri);
        return `${this.commentServiceUrl}/v0/resources/${encodedResourceUri}`;
    }

    getResourceCommentsUri(resourceUri) {
        if (!resourceUri) {
            return `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/comments`;
        }

        let encodedResourceUri = encodeURIComponent(resourceUri);
        return `${this.commentServiceUrl}/v0/resources/${encodedResourceUri}/comments`;
    }

    fetchComments() {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}`;

        return fetch(url, this.getDefaultConfig('GET'))
            .then((response) => {
                if (response.status === 200) {
                    return response.json().then((responseJson) => ({
                        responseJson: responseJson.comments,
                        userAccessLevel: response.headers.get('x-cimpress-resource-access-level'),
                    }));
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else if (response.status === 404) {
                    return {
                        responseJson: [],
                        userAccessLevel: response.headers.get('x-cimpress-resource-access-level'),
                    };
                } else {
                    throw new Error(`Unexpected status code ${response.status}`);
                }
            });
    }

    postComment(comment, visibility) {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/comments`;
        let init = this.getDefaultConfig('POST', {
            comment,
            visibility,
        });

        return fetch(url, init)
            .then((response) => {
                if (response.status === 201) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else {
                    throw new Error(`Unable to create comment for: ${this.resourceUri} Status code: ${response.status})`);
                }
            });
    }

    fetchComment(commentUri) {
        return fetch(commentUri, this.getDefaultConfig('GET'))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else {
                    throw new Error(`Unable to fetch comment: ${commentUri} (Status code: ${response.status})`);
                }
            });
    }

    putComment(commentUri, comment, visibility) {
        let init = this.getDefaultConfig('PUT', {
            comment,
            visibility,
        });

        return fetch(commentUri, init)
            .then((response) => {
                if (response.status === 200) {
                    return this.fetchComment(commentUri)
                        .catch(() => {
                            throw new Error('Error retrieving the comment after putting it');
                        });
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else {
                    throw new Error(`Unable to update comment: ${commentUri} (Status code: ${response.status})`);
                }
            });
    }

    markAsReadAfter(date) {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/read`;
        let init = this.getDefaultConfig('POST', {
            lastReadDate: date,
        });

        return fetch(url, init)
            .then((response) => {
                if (response.status === 204 || response.status === 404) {
                    return;
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else {
                    throw new Error(`Unable to mark comments as read since ${date} (Status code: ${response.status})`);
                }
            });
    }

    getUserInfo() {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/userinfo`;
        return fetch(url, this.getDefaultConfig('GET'))
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new Error('Unauthorized');
                } else if (response.status === 403) {
                    throw new Error('Forbidden');
                } else if (response.status === 404) {
                    return {
                        unreadCount: 0,
                    };
                } else {
                    throw new Error(`Unable to fetch user info (Status code: ${response.status})`);
                }
            });
    }
}
