import { SERVICE_URL } from './config';

export default class CommentsClient {

  constructor (accessToken, resourceUri, commentServiceUrl) {
    this.commentServiceUrl = commentServiceUrl || SERVICE_URL;
    this.resourceUri = resourceUri;
    this.accessToken = accessToken;
  }

  fetchComments () {
    let encodedUri = encodeURIComponent(this.resourceUri);
    let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    let init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    return fetch(url, init).then(response => {
      if (response.status === 200) {
        return response.json().then((responseJson) => responseJson.comments);
      } else if (response.status === 404) {
        return this.createResource().then(responseJson => responseJson.comments);
      } else {
        throw new Error('Unable to fetch comments');
      }
    });
  }

  createResource () {
    let encodedUri = encodeURIComponent(this.resourceUri);
    let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      URI: this.resourceUri
    };
    let init = {
      method: 'PUT',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(url, init).then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        throw new Error('Unable to create resource');
      }
    })
  }

  postComment (comment) {
    let encodedUri = encodeURIComponent(this.resourceUri);
    let url = `${this.commentServiceUrl}/v0/resources/${encodedUri}/comments`;
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    headers.append('Content-Type', 'application/json');
    let payload = {
      comment: comment
    };
    let init = {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(payload)
    };
    return fetch(url, init).then(response => {
      if (response.status === 201) {
        return response.json();
      } else {
        throw new Error(`Unable to create comment for: ${this.resourceUri}`)
      }
    });
  }

}
