const path = require('path');
const fs = require('fs');

function resolveApp(...args) {
  return path.resolve(APP_DIRECTORY, ...args);
}

const APP_DIRECTORY = fs.realpathSync(process.cwd());
const PUBLIC_DIRECTORY = resolveApp('public');
const BUILD_PATH = 'build';
const BUILD_DIRECTORY = resolveApp(PUBLIC_DIRECTORY, BUILD_PATH);

module.exports = {
  APP_DIRECTORY,
  PUBLIC_DIRECTORY,
  BUILD_PATH,
  BUILD_DIRECTORY,
};
