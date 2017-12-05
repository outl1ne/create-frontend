const path = require('path');
/* eslint-disable object-shorthand */
// prettier-ignore

module.exports = ({ name, isDev }) => {
  const json = {
    'name': name,
    'version': '0.1.0',
    'private': true,
    'create-frontend': {},
    'scripts': {
      'dev': 'frontend-scripts dev',
      'build': 'frontend-scripts build',
      'build:debug': 'frontend-scripts build --debug',
    },
    'dependencies': {
      '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '..') : '1.x.x',
      'babel-polyfill': '^6.13.0',
      'eslint': '^4.12.0',
      'eslint-plugin-flowtype': '^2.39.1',
      'eslint-plugin-import': '^2.8.0',
      'eslint-plugin-react': '^7.5.1',
      'normalize.css': '7.x.x'
    },
  };

  return JSON.stringify(json, null, 2);
};
