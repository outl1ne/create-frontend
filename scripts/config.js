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
const HASH_FILENAMES =
  typeof appConfig.hashFileNames === 'boolean' ? appConfig.hashFileNames : true;
const ENABLE_DEV_SOURCEMAPS =
  typeof appConfig.enableDevSourcemaps === 'boolean'
    ? appConfig.enableDevSourcemaps
    : true;
const ENABLE_PROD_SOURCEMAPS =
  typeof appConfig.enableProdSourcemaps === 'boolean'
    ? appConfig.enableProdSourcemaps
    : true;

module.exports = {
  APP_PROTOCOL,
  ENABLE_DEV_SOURCEMAPS,
  ENABLE_PROD_SOURCEMAPS,
  ENTRY_POINTS,
  HASH_FILENAMES,
  IS_DEBUG,
  WEBPACK_DOMAIN,
  WEBPACK_PORT,
  WEBPACK_SERVER,
};
