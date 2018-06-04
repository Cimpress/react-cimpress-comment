const fs = require('fs');
const util = require('util');
const {CimpressTranslationsClient} = require("cimpress-translations");
const KmsAuthenticator = require("./auth0Authorizer");
const iso639 = require('iso-639').iso_639_2;

const SERVICE_ID = '60eff5ed-9ddf-483e-b60a-3135c3c87435';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TRANSLATIONS_PATH = __dirname + '/../src/locales';

async function retrieveTranslations() {

    // Decrypt
    log('Retrieving Auth0 token...');
    let authenticator = new KmsAuthenticator(CLIENT_ID, CLIENT_SECRET);
    let token = await authenticator.getAccessToken();

    // Init translation client
    log(`Retrieving service ${SERVICE_ID} description.`);
    let translationClient = new CimpressTranslationsClient(null, `Bearer ${token}`);
    [err, description] = await to(translationClient.describeService(SERVICE_ID));
    if ( err ) return 1;
    log('Description:');
    log(util.inspect(description, false, null));

    log(`Service description retrieved. Found languages: ${JSON.stringify(description.languages.map(s => s.blobId))}`);
    let languagePromises = [];
    description.languages.forEach(lang => {
        log(`Retrieving language translation for ${lang.blobId}`);
        languagePromises.push(translationClient.getLanguageBlob(SERVICE_ID, lang.blobId));
    });

    [err, langs] = await to(Promise.all(languagePromises));
    if ( err ) return 1;
    log(`Done.`);

    if ( !fs.existsSync(TRANSLATIONS_PATH) ) {
        log('Creating translations folder...');
        fs.mkdirSync(TRANSLATIONS_PATH);
    }

    let allJS_imports = '';
    let allJS_translations = '';
    let twoLetterLang = {};
    let allJS_react_timeago_imports = '';
    let allJS_react_timeago_builders = '';

    langs.forEach(blob => {
        let translationFile1 = `${TRANSLATIONS_PATH}/translations.${blob.blobId}.json`;
        log(`Storing translation ${translationFile1}`);
        fs.writeFileSync(translationFile1, JSON.stringify(blob.data, null, 4));

        twoLetterLang[blob.blobId] = iso639[blob.blobId]["639-1"] || blob.blobId;
        allJS_translations += `    ${blob.blobId}: ${blob.blobId},\n`;
        allJS_imports += `import ${blob.blobId} from './translations.${blob.blobId}.json';\n`;
        allJS_react_timeago_imports += `import ${blob.blobId}Strings from 'react-timeago/lib/language-strings/${twoLetterLang[blob.blobId]}';\n`;

        // react-timeago builders
        allJS_react_timeago_builders += `    ${blob.blobId}: buildFormatter(${blob.blobId}Strings),\n`
    });

    let allJS = `
    
// current component translation files    
${allJS_imports}
    
// BEGIN(react-timeago)
// import language files for react-timeago component
${allJS_react_timeago_imports}    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const twoLetterLang = ${JSON.stringify(twoLetterLang, null, 4)};

const reactTimeAgoFormatters = {
${allJS_react_timeago_builders.substring(0, allJS_react_timeago_builders.length-2)}
};
    
// END(react-time-ago)    
 
const resources = {
${allJS_translations.substring(0, allJS_translations.length - 1)}
};

export { resources, twoLetterLang, reactTimeAgoFormatters };`;

    log('Writing combined language file ...');
    fs.writeFileSync(`${TRANSLATIONS_PATH}/all.js`, allJS);

    return 0;
}

function log(message) {
    console.log(`[translation] ${message}`)
}

function error(message) {
    console.error(`[translation] ${message}`)
}

function to(promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => {
            error(err);
            return [err];
        });
}

retrieveTranslations()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
