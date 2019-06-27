/* eslint-disable object-shorthand */
const path = require('path');

function getCurrentVersion() {
  const appPackage = require(path.resolve(__dirname, '../../', 'package.json'));
  return `^${appPackage.version}`;
}

module.exports = function getTemplate(templateName, { isDev, name }) {
  // default is reserved :(
  const defaultTemplate = {
    name: 'default',
    install: {},
    templatePath: path.resolve(__dirname, 'default'),
    // prettier-ignore
    packageJson: {
      'name': name,
      'version': '0.1.0',
      'private': true,
      'create-frontend': {},
      'browserslist': ['> 0.2%', 'last 1 version', 'not dead'],
      'scripts': {
        'dev': 'frontend-scripts dev',
        'build': 'frontend-scripts build',
        'build:debug': 'frontend-scripts build --debug',
      },
      'dependencies': {
        'core-js': '^3.0.0',
        '@babel/runtime-corejs3': '^7.4.2',
        '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '../../') : getCurrentVersion(),
        'eslint-plugin-flowtype': '~3.9.0',
        'eslint-plugin-import': '^2.16.0',
        'eslint-plugin-react': '^7.12.4',
        'eslint': '^5.13.0',
        'normalize.css': '8.x.x',
      },
    }
  };

  const react = {
    name: 'react',
    install: {
      react: '^16.8.2',
      'react-dom': '^16.8.2',
    },
    mergeDefaultFiles: true,
    templatePath: path.resolve(__dirname, 'react'),
    packageJson: defaultTemplate.packageJson,
  };

  const universalReact = {
    name: 'universal-react',
    install: {
      react: '^16.8.2',
      'react-dom': '^16.8.2',
    },
    mergeDefaultFiles: false,
    templatePath: path.resolve(__dirname, 'universal-react'),
    // prettier-ignore
    packageJson: {
      'name': name,
      'version': '0.1.0',
      'private': true,
      'create-frontend': {
        "publicDirectory": "build",
        "buildPath": "client",
        "entryPoints": {
          "app": "client/entry.js",
        }
      },
      'browserslist': ['> 0.2%', 'last 1 version', 'not dead'],
      'scripts': {
        'dev': 'frontend-scripts dev-universal-react',
        'build': 'frontend-scripts build-universal-react',
        'build:debug': 'frontend-scripts build-universal-react --debug',
        'start': 'frontend-scripts start-universal-react'
      },
      'dependencies': {
        'core-js': '^3.0.0',
        '@babel/runtime-corejs3': '^7.4.2',
        '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '../../') : getCurrentVersion(),
        'detect-port': '^1.3.0',
        'dotenv': '^6.2.0',
        'eslint-plugin-flowtype': '~3.9.0',
        'eslint-plugin-import': '^2.16.0',
        'eslint-plugin-react': '^7.12.4',
        'eslint': '^5.13.0',
        'express': '^4.16.4',
        'normalize.css': '8.x.x',
        'react-helmet-async': '^0.2.0',
        'react-router': '^4.3.1',
        'react-router-dom': '^4.3.1'
      },
    },
    postGenerationMessages: [
      'For development, type `npm run dev`.',
      'For production, type `npm run build` to build and `npm run start` to serve.',
      'Documentation: https://github.com/optimistdigital/create-frontend/blob/feature/universal-react/docs/universal-react.md',
    ],
  };

  const templates = {
    default: defaultTemplate,
    react,
    'universal-react': universalReact,
  };

  return templates[templateName];
};
