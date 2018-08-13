import i18n from 'i18next';
import {reactI18nextModule} from 'react-i18next';

import {resources} from '../locales/all';

let i18nInstance = null;

function getI18nInstance() {
    if ( !i18nInstance ) {
        i18nInstance = i18n.createInstance();

        i18nInstance
            .use(reactI18nextModule)
            .init({

                fallbackLng: 'eng',

                resources: resources,

                ns: ['translations'],
                defaultNS: 'translations',

                debug: false,

                interpolation: {
                    escapeValue: false, // not needed for react!!
                },

                react: {
                    wait: true,
                },
            });
    }

    return i18nInstance;
}

export {
    getI18nInstance,
};
