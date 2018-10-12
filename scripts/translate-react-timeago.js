const fs = require('fs');
const iso639 = require('iso-639').iso_639_2;

// eslint-disable-next-line no-console
const log = (message) => console.log('[translation]', message);

const TRANSLATIONS_PATH = __dirname + '/../src/locales';
const translations = require('../src/locales/translations');
const langs = Object.keys(translations);

let rtaImports = '';
let rtaBuilders = '';

langs.forEach((lang3) => {
    let lang2 = iso639[lang3]['639-1'] || lang3;
    rtaImports += `import ${lang3}Strings from 'react-timeago/lib/language-strings/${lang2}';\n`;
    rtaBuilders += `    ${lang3}: buildFormatter(${lang3}Strings),\n`;
});

let allJS = `
// import language files for react-timeago component
${rtaImports}    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const reactTimeAgoFormatters = {
${rtaBuilders.substring(0, rtaBuilders.length-2)}
};
    
export { reactTimeAgoFormatters };`;

log('Writing reactTimeAgoFormatters ...');
fs.writeFileSync(`${TRANSLATIONS_PATH}/reactTimeAgoFormatters.js`, allJS);

