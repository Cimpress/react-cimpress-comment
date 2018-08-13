module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
    },
    "parserOptions": {
        "ecmaVersion": 7,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
        }
    },
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "google"
    ],
    "rules": {
        "indent": ["error", 4],
        "require-jsdoc": ["off"],
        "max-len": ["off", 160]
    }
};