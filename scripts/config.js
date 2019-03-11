const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const { resolveApp } = require('./paths');
const detectPort = require('detect-port');

let odWebpackConfig = {};
if (fs.existsSync(resolveApp('create-frontend.conf.js'))) {
  try {
    odWebpackConfig = require(resolveApp('create-frontend.conf'));
  } catch (err) {
    console.error('Error in create-frontend.conf.js file:', err);
  }
}

const config = Object.assign({}, require(resolveApp('package.json'))['create-frontend'] || {}, odWebpackConfig);
function getConfigValue(key, fallback) {
  if (config[key] == null) {
    return fallback;
  }
  return config[key];
}

module.exports = async function getConfig() {
  const WEBPACK_PORT = await getPort(args.webpackPort || 3000);
  const IS_DEBUG = !!args.debug;
  const APP_PROTOCOL = args.protocol || 'http';
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
  const BROWSERS_LIST = getConfigValue('browserslist', ['> 0.2%', 'last 1 version', 'not dead']);
  const SERVER_ENTRY_POINT = getConfigValue('serverEntryPoint', 'server/entry.js');
  const USE_EMOTION = getConfigValue('useEmotion', false);

  const APP_DIRECTORY = fs.realpathSync(process.cwd());
  const SERVER_BUILD_DIRECTORY = resolveApp(getConfigValue('serverBuildPath', 'build/server'));
  const BUILD_PATH = getConfigValue('buildPath', 'build');
  const PUBLIC_DIRECTORY = resolveApp(getConfigValue('publicDirectory', 'public'));
  const BUILD_DIRECTORY = resolveApp(PUBLIC_DIRECTORY, BUILD_PATH);
  const HTML_PATH = resolveApp(getConfigValue('htmlPath', 'client/html'));
  const SERVER_OUTPUT_FILE = 'build-server';
  const MANIFEST_PATH = resolveApp(BUILD_DIRECTORY, 'asset-manifest.json');

  return {
    APP_DIRECTORY,
    APP_PROTOCOL,
    APPEND_PLUGINS,
    BROWSERS_LIST,
    BUILD_DIRECTORY,
    BUILD_PATH,
    EDIT_CONFIG,
    EDIT_DEV_SERVER_CONFIG,
    ENABLE_DEV_SOURCEMAPS,
    ENABLE_PROD_SOURCEMAPS,
    ENTRY_POINTS,
    HASH_FILENAMES,
    HTML_OPTIONS,
    HTML_PATH,
    IS_DEBUG,
    PREPEND_RULES,
    PUBLIC_DIRECTORY,
    SERVER_BUILD_DIRECTORY,
    SERVER_ENTRY_POINT,
    WEBPACK_DOMAIN,
    WEBPACK_PORT,
    WEBPACK_SERVER,
    SERVER_OUTPUT_FILE,
    MANIFEST_PATH,
    USE_EMOTION,
  };
};

// Store resolved port so that we get the same one on each getConfig() call,
// even after the port has already been used by our own logic
let resolvedPort;
async function getPort(desiredPort) {
  if (resolvedPort) {
    return resolvedPort;
  }

  const WEBPACK_PORT = await detectPort(desiredPort);

  resolvedPort = WEBPACK_PORT;
  return resolvedPort;
}
