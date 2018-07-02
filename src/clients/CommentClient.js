import FetchClient from './FetchClient';

export default class CommentClient extends FetchClient {

    constructor(accessToken, commentUri) {
        super(accessToken);
        this.commentUri = commentUri;
    }

    fetchComment() {
        let init = this.getDefaultConfig('GET');

        return fetch(this.commentUri, init)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 401) {
                    throw new Error('Unauthorized')
                } else if (response.status === 403) {
                    throw new Error('Forbidden')
                } else {
                    throw new Error(`Unable to fetch comment: ${this.commentUri} (Status code: ${response.status})`);
                }
            });
    }

    putComment(comment, visibility) {
        let init = this.getDefaultConfig('PUT', {
            comment,
            visibility
        });

        return fetch(this.commentUri, init)
            .then(response => {
                if (response.status === 200) {
                    return this.fetchComment()
                        .catch(() => {
                            throw new Error('Error retrieving the comment after putting it');
                        });
                } else if (response.status === 401) {
                    throw new Error('Unauthorized')
                } else if (response.status === 403) {
                    throw new Error('Forbidden')
                } else {
                    throw new Error(`Unable to update comment: ${this.commentUri} (Status code: ${response.status})`);
                }
            });
    }
}
