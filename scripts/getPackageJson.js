'use strict';
const path = require('path');

module.exports = ({ name, isDev }) => {
  const json = {
    name: name,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'od-frontend dev',
      build: 'od-frontend build',
      'build:debug': 'od-frontend build --debug',
    },
    dependencies: {
      'normalize.css': '7.x.x',
      'od-frontend': isDev ? path.resolve(__dirname, '..') : '1.x.x',
    },
  };

  return JSON.stringify(json, null, 2);
};
