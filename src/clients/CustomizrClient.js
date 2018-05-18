import FetchClient from './FetchClient';

const CUSTOMIZR_URL = (process && process.env ? process.env.CUSTOMIZR_URL : null) || 'https://customizr.at.cimpress.io';

export default class CustomizrClient extends FetchClient {

    constructor(accessToken, customizrResource) {
        super(accessToken);

        let encodedCustomizrResource = encodeURIComponent(customizrResource || `https://comment.trdlnk.cimpress.io/`);
        this.url = `${CUSTOMIZR_URL}/v1/resources/${encodedCustomizrResource}/settings`;
    }

    fetchSettings() {

        let init = this.getDefaultConfig('GET');

        return fetch(this.url, init)
            .then(response => {
                if ( response.status === 200 ) {
                    return response.json();
                } else {
                    throw new Error(`Unable to fetch user settings from Customizr`);
                }
            });
    }

    putSettings(settings) {
        let init = this.getDefaultConfig('PUT', settings);

        return fetch(this.url, init)
    }
}
