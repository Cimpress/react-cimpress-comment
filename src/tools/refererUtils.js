'use strict';
const url = require('url');

const isCimpressDomain = (link) => /(^|.)cimpress.(io|com)$/.test(url.parse(link || '').host);

const makeIntoLabel = (link) => url.parse(link || '').host;

module.exports = {
    isCimpressDomain,
    makeIntoLabel,
};
