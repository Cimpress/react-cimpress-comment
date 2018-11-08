
// import language files for react-timeago component
import spaStrings from 'react-timeago/lib/language-strings/es';
import bulStrings from 'react-timeago/lib/language-strings/bg';
import engStrings from 'react-timeago/lib/language-strings/en';
import polStrings from 'react-timeago/lib/language-strings/pl';
import fraStrings from 'react-timeago/lib/language-strings/fr';
import deuStrings from 'react-timeago/lib/language-strings/de';
    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const reactTimeAgoFormatters = {
    spa: buildFormatter(spaStrings),
    bul: buildFormatter(bulStrings),
    eng: buildFormatter(engStrings),
    pol: buildFormatter(polStrings),
    fra: buildFormatter(fraStrings),
    deu: buildFormatter(deuStrings)
};
    
export { reactTimeAgoFormatters };