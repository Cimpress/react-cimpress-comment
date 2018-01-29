import { AUTH_SERVICE_URL } from './config';

export default class MentionsClient {

  constructor (accessToken) {
    this.accessToken = accessToken;
    this.principalUri = `${AUTH_SERVICE_URL}/auth/access-management/v1/principals`;
  }

  fetchMatchingMentions (query) {
    let headers = new Headers();
    headers.append('Authorization', `Bearer ${this.accessToken}`);
    let init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default'
    };
    if (query && query.length > 0)
      return fetch(`${this.principalUri}?q=${query}`, init).then(response => {
        if (response.status === 200) {
          return response.json().then(responseJson => responseJson.principals.map(p => { return {id: p.user_id, display: p.name}; }));
        } else {
          throw new Error(`Unable to fetch principals for query: ${query}`);
        }
      });
    else {
      return Promise.resolve([]);
    }
  }

}
