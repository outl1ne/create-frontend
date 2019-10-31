const { resolveApp } = require('../paths');
const fs = require('fs');
const JSON5 = require('json5');

/**
 * Tries to find babel.config.js or .babelrc in user's app root,
 * otherwise falls back to our own babel-preset.js
 */
const getConfig = () => {
  if (fs.existsSync(resolveApp('babel.config.js'))) {
    const config = require(resolveApp('babel.config.js'));

    if (typeof config === 'function') {
      return config();
    }

    return config;
  }

  if (fs.existsSync(resolveApp('.babelrc'))) {
    return JSON5.parse(fs.readFileSync(resolveApp('.babelrc'), 'utf8'));
  }

  return require('../../babel-config');
};

module.exports = () => ({
  ...getConfig(),
  babelrc: false,
  configFile: false,
});
