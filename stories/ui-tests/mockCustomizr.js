import axios from 'axios';

const MockAdapter = require('axios-mock-adapter');
const mock = new MockAdapter(axios);

const mockCustomizer = () => {
    mock.onGet('https://customizr.at.cimpress.io/v1/resources/https%3A%2F%2Fcomment.trdlnk.cimpress.io%2F/settings')
        .reply(200, {
            mentionsUsageNotification: {
                alertDismissed: true,
            },
        });
};

export {mockCustomizer};
