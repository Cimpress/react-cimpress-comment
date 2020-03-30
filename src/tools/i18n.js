import i18n from 'i18next';

let i18nInstance = null;

function getI18nInstance() {
    if ( !i18nInstance ) {
        i18nInstance = i18n.createInstance();

        i18nInstance
            .init({

                fallbackLng: 'en',

                resources: {
                    en: require('../locales/react-cimpress-comments.en'),
                    de: require('../locales/react-cimpress-comments.de'),
                    fr: require('../locales/react-cimpress-comments.fr'),
                    it: require('../locales/react-cimpress-comments.it'),
                    nl: require('../locales/react-cimpress-comments.nl'),
                    ja: require('../locales/react-cimpress-comments.ja'),
                },

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
