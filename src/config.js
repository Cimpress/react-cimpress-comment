const AUTH_SERVICE_URL = (process && process.env ? process.env.AUTH_SERVICE_URL : null) || 'https://api.cimpress.io';
const SERVICE_URL = (process && process.env ? process.env.COMMENT_SERVICE_URL : null) || 'https://comment.trdlnk.cimpress.io';
const CUSTOMIZR_URL = (process && process.env ? process.env.CUSTOMIZR_URL : null) || 'https://customizr.at.cimpress.io';


export {
  SERVICE_URL,
  AUTH_SERVICE_URL,
  CUSTOMIZR_URL
};
