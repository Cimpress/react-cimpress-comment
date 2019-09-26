import Request from 'superagent';

const BASE_URL = 'https://puremail.trdlnk.cimpress.io';

const Stereotype = {
    xCimpressRelBlacklist: 'https://fulfillment.at.cimpress.io/rels/jobsheet,https://fulfillment.at.cimpress.io/rels/document,https://fulfillment.at.cimpress.io/rels/notifications',
    // xCimpressRelWhitelist: '', // 'mentionedPrincipal,currentComment,resource,comments,createdByPrincipal,updatedByPrincipal',
    defaultTimeout: 30000,
    acceptPreference: 'image/*;q=0.1,application/pdf;q=0.95,application/links+json;q=0.9,application/hal+json;q=0.8,application/json;q=0.7,*/*;q=0.6',
};

const sendEmail = (accessToken, idTemplate, jsonResources) => {
    return Request
        .post(BASE_URL + '/v1/send/' + idTemplate)
        .set('Authorization', 'Bearer ' + accessToken)
        .set('Content-Type', 'application/json')
        .set('x-cimpress-rel-blacklist', Stereotype.xCimpressRelBlacklist)
        .set('x-cimpress-accept-preference', Stereotype.acceptPreference)
        .set('x-cimpress-crawler-soft-errors', '403,404')
        .send(jsonResources)
        .then((a) => a.body);
};

const sendRawEmail = (accessToken, rawMime) => {
    return Request
        .post(BASE_URL + '/v1/sendRawEmail')
        .set('Authorization', 'Bearer ' + accessToken)
        .set('Content-Type', 'text/plain')
        .send(rawMime)
        .then((a) => a.body);
};

export {
    sendEmail,
    sendRawEmail,
};
