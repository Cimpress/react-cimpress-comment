
// import language files for react-timeago component
import deuStrings from 'react-timeago/lib/language-strings/de';
import engStrings from 'react-timeago/lib/language-strings/en';
import fraStrings from 'react-timeago/lib/language-strings/fr';
import spaStrings from 'react-timeago/lib/language-strings/es';
import polStrings from 'react-timeago/lib/language-strings/pl';
import bulStrings from 'react-timeago/lib/language-strings/bg';
    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const reactTimeAgoFormatters = {
    deu: buildFormatter(deuStrings),
    eng: buildFormatter(engStrings),
    fra: buildFormatter(fraStrings),
    spa: buildFormatter(spaStrings),
    pol: buildFormatter(polStrings),
    bul: buildFormatter(bulStrings)
};
    
export { reactTimeAgoFormatters };