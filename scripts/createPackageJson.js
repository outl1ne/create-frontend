/* eslint-disable object-shorthand */
const path = require('path');

function getCurrentVersion() {
  const appPackage = require(path.resolve(__dirname, '..', 'package.json'));
  return `^${appPackage.version}`;
}

// prettier-ignore
module.exports = ({ name, isDev, customDependencies = {} }) => {
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
      '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '..') : getCurrentVersion(),
      '@babel/polyfill': '^7.2.5',
      'eslint': '^5.13.0',
      'eslint-plugin-flowtype': '^3.4.2',
      'eslint-plugin-import': '^2.16.0',
      'eslint-plugin-react': '^7.12.4',
      'normalize.css': '8.x.x'
    },
  };

  if (customDependencies) {
    Object.entries(customDependencies).forEach(([depName, depVersion]) => {
      json.dependencies[depName] = depVersion;
    });
  }

  return JSON.stringify(json, null, 2);
};
