
// import language files for react-timeago component
import deStrings from 'react-timeago/lib/language-strings/de';
import frStrings from 'react-timeago/lib/language-strings/fr';
import nlStrings from 'react-timeago/lib/language-strings/nl';
import enStrings from 'react-timeago/lib/language-strings/en';
import itStrings from 'react-timeago/lib/language-strings/it';
import jaStrings from 'react-timeago/lib/language-strings/ja';

import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

const reactTimeAgoFormatters = {
    de: buildFormatter(deStrings),
    fr: buildFormatter(frStrings),
    en: buildFormatter(enStrings),
    nl: buildFormatter(nlStrings),
    it: buildFormatter(itStrings),
    ja: buildFormatter(jaStrings)
};

export { reactTimeAgoFormatters };
