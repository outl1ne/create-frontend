const path = require('path');
/* eslint-disable object-shorthand */
// prettier-ignore

module.exports = ({ name, isDev }) => {
  const json = {
    'name': name,
    'version': '0.1.0',
    'private': true,
    'scripts': {
      'dev': 'od-frontend dev',
      'build': 'od-frontend build',
      'build:debug': 'od-frontend build --debug',
    },
    'od-frontend': {
      'publicDirectory': 'public',
      'buildPath': 'build',
      'entryPoints': {
        'app': 'client/js/entry.js',
      },
      'hashFileNames': true
    },
    'dependencies': {
      'babel-polyfill': '^6.13.0',
      'eslint': '^4.12.0',
      'eslint-plugin-flowtype': '^2.39.1',
      'eslint-plugin-import': '^2.8.0',
      'eslint-plugin-react': '^7.5.1',
      'normalize.css': '7.x.x',
      'od-frontend': isDev ? path.resolve(__dirname, '..') : '1.x.x',
    },
  };

  return JSON.stringify(json, null, 2);
};
