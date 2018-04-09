const args = require('minimist')(process.argv.slice(2));
const paths = require('./paths');
const fs = require('fs');

const appPackage = require(paths.resolveApp('package.json'));
const appConfig = appPackage['create-frontend'] || {};

let odWebpackConfig = {};
if (fs.existsSync(paths.resolveApp('create-frontend.conf.js'))) {
  try {
    odWebpackConfig = require(paths.resolveApp('create-frontend.conf'));
  } catch (err) {
    console.error('Error in create-frontend.conf.js file:', err);
  }
}

const IS_DEBUG = !!args.debug;
const APP_PROTOCOL = args.protocol || 'http';
const WEBPACK_PORT = args.webpackPort || 8000;
const WEBPACK_DOMAIN = args.webpackDomain || 'localhost';
const WEBPACK_SERVER = `${APP_PROTOCOL}://${WEBPACK_DOMAIN}:${WEBPACK_PORT}`;

const ENTRY_POINTS = getAppConfigValue('entryPoints', {
  app: 'client/js/entry.js',
});
const HASH_FILENAMES = getAppConfigValue('hashFileNames', true);
const ENABLE_DEV_SOURCEMAPS = getAppConfigValue('enableDevSourcemaps', true);
const ENABLE_PROD_SOURCEMAPS = getAppConfigValue('enableProdSourcemaps', false);
const HTML_OPTIONS = getAppConfigValue('htmlOptions', {});

const APPEND_PLUGINS = getWebpackConfigValue('appendPlugins', () => []);
const PREPEND_RULES = getWebpackConfigValue('prependRules', () => []);
const MERGE_CONFIG = getWebpackConfigValue('mergeConfig', () => ({}));
const MERGE_DEV_SERVER_CONFIG = getWebpackConfigValue(
  'mergeDevServerConfig',
  () => ({})
);

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
  APPEND_PLUGINS,
  PREPEND_RULES,
  MERGE_CONFIG,
  MERGE_DEV_SERVER_CONFIG,
  HTML_OPTIONS,
};

/**
 * Utils
 */

function getWebpackConfigValue(key, fallback) {
  if (odWebpackConfig[key] == null) {
    return fallback;
  }
  return odWebpackConfig[key];
}

function getAppConfigValue(key, fallback) {
  if (appConfig[key] == null) {
    return fallback;
  }
  return appConfig[key];
}
