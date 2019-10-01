
// import language files for react-timeago component
import deuStrings from 'react-timeago/lib/language-strings/de';
import fraStrings from 'react-timeago/lib/language-strings/fr';
import bulStrings from 'react-timeago/lib/language-strings/bg';
import polStrings from 'react-timeago/lib/language-strings/pl';
import spaStrings from 'react-timeago/lib/language-strings/es';
import engStrings from 'react-timeago/lib/language-strings/en';
    
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const reactTimeAgoFormatters = {
    deu: buildFormatter(deuStrings),
    fra: buildFormatter(fraStrings),
    bul: buildFormatter(bulStrings),
    pol: buildFormatter(polStrings),
    spa: buildFormatter(spaStrings),
    eng: buildFormatter(engStrings)
};
    
export { reactTimeAgoFormatters };