export default class CommentClient {

  constructor (accessToken, commentUri) {
    this.accessToken = accessToken;
    this.commentUri = commentUri;
  }

  fetchComment () {
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    let init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    return fetch(this.commentUri, init).then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error(`Unable to fetch comment: ${this.commentUri}`);
      }
    });
  }

  putComment (comment) {
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      comment: comment
    };
    let init = {
      method: 'PUT',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };

    return fetch(this.commentUri, init).then(response => {
      if (response.status === 200) {
        return this.fetchComment().catch(() => {
          throw new Error('Error retrieving the comment after putting it');
        });
      } else {
        throw new Error(`Unable to update comment: ${this.commentUri}`);
      }
    });
  }

}
