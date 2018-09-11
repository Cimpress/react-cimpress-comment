const atob = require('atob');

function getSubFromJWT(jwt) {
    try {
        return JSON.parse(atob(jwt.split('.')[1])).sub;
    } catch (e) {
        return null;
    }
}

function errorToString(e) {
    if (!e) {
        return '';
    }

    if (e instanceof Error) {
        return e.message;
    } else if (typeof e === 'string') {
        return e;
    }

    return e.toString();
}

const isMac = window.navigator.platform.includes('Mac');
const isMeta = (key) => (isMac && key.key === 'Meta') || (!isMac && key.key === 'Control');
const markMetaKeyUp = (locality) => (key) => {
    if (isMeta(key)) {
        locality.metaDown = false;
    }
};
const performActionOnMetaEnter = (locality, actionMetaEnter) => (key) => {
    if (isMeta(key)) {
        locality.metaDown = true;
    } else if (locality.metaDown && key.key === 'Enter') {
        actionMetaEnter();
    }
};


export {
    getSubFromJWT,
    errorToString,
    markMetaKeyUp,
    performActionOnMetaEnter,
};
