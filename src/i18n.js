import i18n from 'i18next';
import { reactI18nextModule } from 'react-i18next';

import {resources} from './locales/all';

i18n
    .use(reactI18nextModule)
    .init({

        lng: 'eng',
        fallbackLng: 'eng',

        resources: resources,

        // have a common namespace used around the full app
        ns: ['translations'],
        defaultNS: 'translations',

        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react!!
        },

        react: {
            wait: true
        }
    });


export default i18n;