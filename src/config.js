const COMMENT_SERVICE_URL = 'https://comment.trdlnk.cimpress.io';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://https://api.cimpress.io';
const SERVICE_URL = process.env.COMMENT_SERVICE_URL || COMMENT_SERVICE_URL;
export {
  SERVICE_URL,
  AUTH_SERVICE_URL
};
