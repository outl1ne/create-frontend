const path = require('path');
const fs = require('fs');

function resolveApp(...args) {
  return path.resolve(APP_DIRECTORY, ...args);
}

const APP_DIRECTORY = fs.realpathSync(process.cwd());
const appPackage = require(resolveApp('package.json'));
const appConfig = appPackage['od-frontend'] || {};
const BUILD_PATH = appConfig.buildPath || 'build';
const PUBLIC_DIRECTORY = resolveApp(appConfig.publicDirectory || 'public');
const BUILD_DIRECTORY = resolveApp(PUBLIC_DIRECTORY, BUILD_PATH);

module.exports = {
  resolveApp,
  APP_DIRECTORY,
  PUBLIC_DIRECTORY,
  BUILD_PATH,
  BUILD_DIRECTORY,
};