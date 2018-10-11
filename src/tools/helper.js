const atob = require('atob');

function getSubFromJWT(jwt) {
    try {
        return JSON.parse(atob(jwt.split('.')[1])).sub;
    } catch (e) {
        return null;
    }
}

function errorToString(e) {
    console.log(e);
    console.log(JSON.stringify(e))
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

const performActionOnMetaEnter = (actionMetaEnter) => (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        actionMetaEnter();
    }
};

export {
    getSubFromJWT,
    errorToString,
    performActionOnMetaEnter,
};
