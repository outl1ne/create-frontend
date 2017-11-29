const args = require('minimist')(process.argv.slice(2));
const paths = require('./paths');

const appPackage = require(paths.resolveApp('package.json'));
const appConfig = appPackage['od-frontend'] || {};

const IS_DEBUG = !!args.debug;
const APP_PROTOCOL = args.protocol || 'http';
const WEBPACK_PORT = args.webpackPort || 8000;
const WEBPACK_DOMAIN = args.webpackDomain || 'localhost';
const WEBPACK_SERVER = `${APP_PROTOCOL}://${WEBPACK_DOMAIN}:${WEBPACK_PORT}`;
const ENTRY_POINTS = appConfig.entryPoints || {
  app: 'client/js/entry.js',
};

module.exports = {
  IS_DEBUG,
  APP_PROTOCOL,
  WEBPACK_PORT,
  WEBPACK_DOMAIN,
  WEBPACK_SERVER,
  ENTRY_POINTS,
};
