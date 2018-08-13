
    
// current component translation files    
import bul from './translations.bul.json';
import deu from './translations.deu.json';
import eng from './translations.eng.json';
import fra from './translations.fra.json';
import pol from './translations.pol.json';
import spa from './translations.spa.json';

    
// BEGIN(react-timeago)
// import language files for react-timeago component
import bulStrings from 'react-timeago/lib/language-strings/bg';
import deuStrings from 'react-timeago/lib/language-strings/de';
import engStrings from 'react-timeago/lib/language-strings/en';
import fraStrings from 'react-timeago/lib/language-strings/fr';
import polStrings from 'react-timeago/lib/language-strings/pl';
import spaStrings from 'react-timeago/lib/language-strings/es';
    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const twoLetterLang = {
    "bul": "bg",
    "deu": "de",
    "eng": "en",
    "fra": "fr",
    "pol": "pl",
    "spa": "es"
};

const reactTimeAgoFormatters = {
    bul: buildFormatter(bulStrings),
    deu: buildFormatter(deuStrings),
    eng: buildFormatter(engStrings),
    fra: buildFormatter(fraStrings),
    pol: buildFormatter(polStrings),
    spa: buildFormatter(spaStrings)
};
    
// END(react-time-ago)    
 
const resources = {
    bul: bul,
    deu: deu,
    eng: eng,
    fra: fra,
    pol: pol,
    spa: spa,
};

export { resources, twoLetterLang, reactTimeAgoFormatters };