import FetchClient from './FetchClient';

const SERVICE_URL = (process && process.env ? process.env.COMMENT_SERVICE_URL : null) || 'https://comment.trdlnk.cimpress.io';

export default class CommentsClient extends FetchClient {

    constructor(accessToken, resourceUri, commentServiceUrl) {
        super(accessToken);
        this.commentServiceUrl = commentServiceUrl || SERVICE_URL;
        this.resourceUri = resourceUri;
        this.encodedResourceUri = encodeURIComponent(resourceUri);
    }

    getResourceUri(resourceUri) {
        if ( !resourceUri ) {
            return `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/comments`;
        }

        let encodedResourceUri = encodeURIComponent(resourceUri);
        return `${this.commentServiceUrl}/v0/resources/${encodedResourceUri}/comments`;
    }

    fetchComments() {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}`;
        let init = this.getDefaultConfig('GET');

        return fetch(url, init)
            .then(response => {
                if ( response.status === 200 ) {
                    return response.json().then((responseJson) => ({
                        responseJson: responseJson.comments,
                        userAccessLevel: response.headers.get("x-cimpress-resource-access-level")
                    }));
                } else if ( response.status === 404 ) {
                    return this.createResource().then(responseJson => ({
                        responseJson: responseJson.comments,
                        userAccessLevel: response.headers.get("x-cimpress-resource-access-level")
                    }));
                } else {
                    throw new Error('Unable to fetch comments');
                }
            });
    }

    createResource() {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}`;
        let init = this.getDefaultConfig('PUT', {
            URI: this.resourceUri
        });

        return fetch(url, init)
            .then(response => {
                if ( response.status >= 200 && response.status < 300 ) {
                    return response.json();
                } else {
                    throw new Error('Unable to create resource');
                }
            });
    }

    postComment(comment, accessibility) {
        let url = `${this.commentServiceUrl}/v0/resources/${this.encodedResourceUri}/comments`;
        let init = this.getDefaultConfig('POST', {
            comment,
            accessibility
        });

        return fetch(url, init).then(response => {
            if ( response.status === 201 ) {
                return response.json();
            } else {
                throw new Error(`Unable to create comment for: ${this.resourceUri}`);
            }
        });
    }

}
