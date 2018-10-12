import {configure} from '@storybook/react';

function loadStories() {
    if (process.env.LOCAL_DEVELOPMENT === 'yes') {
        require('../stories/development/stories');
    } else {
        require('../stories/ui-tests/stories');
    }
}

configure(loadStories, module);
