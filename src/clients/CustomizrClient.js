import _FetchClient from './_FetchClient';
import merge from 'deepmerge';
import md5 from 'md5';

const CUSTOMIZR_URL = (process && process.env ? process.env.CUSTOMIZR_URL : null) || 'https://customizr.at.cimpress.io';

const cache = {};

export default class CustomizrClient extends _FetchClient {
    constructor(accessToken, customizrResource) {
        super(accessToken);

        let encodedCustomizrResource = encodeURIComponent(customizrResource || `https://comment.trdlnk.cimpress.io/`);
        this.url = `${CUSTOMIZR_URL}/v1/resources/${encodedCustomizrResource}/settings`;
    }

    _getKey() {
        return md5(this.accessToken + '|' + this.url);
    }

    fetchSettings(useCache = true) {
        if (useCache) {
            let key = this._getKey();
            if (cache[key]) {
                return Promise.resolve(cache[key]);
            }
        }

        let init = this.getDefaultConfig('GET');

        return fetch(this.url, init)
            .then((response) => {
                if (response.status === 200) {
                    let data = response.json();
                    cache[this._getKey()] = data;
                    return data;
                }
                return {};
            });
    }

    putSettings(settings) {
        let init = this.getDefaultConfig('PUT', settings);

        return fetch(this.url, init)
            .then(() => cache[this._getKey()] = settings);
    }

    updateSettings(settings) {
        return this.fetchSettings(false)
            .then((json) => {
                let merged = merge(json, settings);
                return this.putSettings(merged);
            });
    }
}
