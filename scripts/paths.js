const path = require('path');
const fs = require('fs');
const APP_DIRECTORY = fs.realpathSync(process.cwd());

module.exports.resolveApp = function resolveApp(...args) {
  return path.resolve(APP_DIRECTORY, ...args);
};

module.exports.resolveOwn = function resolveOwn(...args) {
  return path.resolve(__dirname, '..', ...args);
};
