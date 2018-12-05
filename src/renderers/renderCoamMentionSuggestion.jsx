
import {React} from 'react';

const renderCoamMentionSuggestion = (entry, search, highlightedDisplay, index) => {
    return <span>{highlightedDisplay} <i><small>{entry.email}</small></i></span>;
};

export default renderCoamMentionSuggestion;
