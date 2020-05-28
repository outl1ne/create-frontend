const dotenv = require('dotenv');

let watching = false;

module.exports = {
  /**
   * This is a wrapper around dotenv.config() that also listens for changes to the .env file in development,
   * and updates env variables if new ones are added, or old ones are changed.
   */
  config(opts = {}) {
    let parsed = dotenv.config().parsed || {};

    // In case config() was called twice, we still want to listen for changes
    // only once, so we keep track of whether we're already doing that.
    if (process.env.NODE_ENV === 'development' && opts.reload && !watching) {
      watching = true;

      const { resolveApp } = require('./paths');
      const dotEnvPath = resolveApp('.env');

      require('chokidar')
        .watch(dotEnvPath)
        .on('change', () => {
          console.info('ℹ️  Changes to .env detected. Reloading environment variables.');

          // Find existing variables loaded from dotenv.config() that were changed, and update them
          const newContents = dotenv.parse(require('fs').readFileSync(dotEnvPath)) || {};
          Object.keys(newContents).forEach(newKey => {
            if (parsed[newKey] !== undefined) {
              process.env[newKey] = newContents[newKey];
            }
          });
          // Find variables that were loaded from dotenv.config() but were since removed from .env
          Object.keys(parsed).forEach(oldKey => {
            if (newContents[oldKey] === undefined) {
              delete process.env[oldKey];
            }
          });
          // Load new variables that were added to .env
          parsed = Object.assign({}, dotenv.config().parsed || {}, parsed);
        });
    }
  },
};
