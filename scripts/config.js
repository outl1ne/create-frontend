const args = require('minimist')(process.argv.slice(2));

const IS_DEBUG = !!args.debug;
const APP_PROTOCOL = args.protocol || 'http';
const WEBPACK_PORT = args.webpackPort || 8000;
const WEBPACK_DOMAIN = args.webpackDomain || 'localhost';
const WEBPACK_SERVER = `${APP_PROTOCOL}://${WEBPACK_DOMAIN}:${WEBPACK_PORT}`;
const ENTRY_POINTS = {
  app: 'src/scripts/entry.js',
};

module.exports = {
  IS_DEBUG,
  APP_PROTOCOL,
  WEBPACK_PORT,
  WEBPACK_DOMAIN,
  WEBPACK_SERVER,
  ENTRY_POINTS,
};
