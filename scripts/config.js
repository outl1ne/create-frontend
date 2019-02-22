const args = require('minimist')(process.argv.slice(2));
const paths = require('./paths');
const fs = require('fs');

let odWebpackConfig = {};
if (fs.existsSync(paths.resolveApp('create-frontend.conf.js'))) {
  try {
    odWebpackConfig = require(paths.resolveApp('create-frontend.conf'));
  } catch (err) {
    console.error('Error in create-frontend.conf.js file:', err);
  }
}

const config = Object.assign(
  {},
  require(paths.resolveApp('package.json'))['create-frontend'] || {},
  odWebpackConfig
);
function getConfigValue(key, fallback) {
  if (config[key] == null) {
    return fallback;
  }
  return config[key];
}

module.exports = function getConfig(target) {
  const IS_DEBUG = !!args.debug;
  const APP_PROTOCOL = args.protocol || 'http';
  const WEBPACK_PORT = args.webpackPort || 8000;
  const WEBPACK_DOMAIN = args.webpackDomain || 'localhost';
  const WEBPACK_SERVER = `${APP_PROTOCOL}://${WEBPACK_DOMAIN}:${WEBPACK_PORT}`;
  const ENTRY_POINTS = getConfigValue('entryPoints', {
    app: 'client/js/entry.js',
  });
  const HASH_FILENAMES = getConfigValue('hashFileNames', true);
  const ENABLE_DEV_SOURCEMAPS = getConfigValue('enableDevSourcemaps', true);
  const ENABLE_PROD_SOURCEMAPS = getConfigValue('enableProdSourcemaps', false);
  const HTML_OPTIONS = getConfigValue('htmlOptions', {});
  const APPEND_PLUGINS = getConfigValue('appendPlugins', () => []);
  const PREPEND_RULES = getConfigValue('prependRules', () => []);
  const EDIT_CONFIG = getConfigValue('editConfig', _ => _);
  const EDIT_DEV_SERVER_CONFIG = getConfigValue('editDevServerConfig', _ => _);
  const BROWSERS_LIST = getConfigValue('browserslist', [
    '>1%',
    'last 3 versions',
    'not ie < 11',
  ]);

  return {
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
    EDIT_CONFIG,
    EDIT_DEV_SERVER_CONFIG,
    HTML_OPTIONS,
    BROWSERS_LIST,
  };
};
