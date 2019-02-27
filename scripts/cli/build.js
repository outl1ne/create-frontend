/** @flow
 * This function starts a webpack production builds.
 */
module.exports = (config, report = true) => {
  const log = (...args) => (report ? console.log(...args) : null);

  return new Promise((resolve, reject) => {
    /**
     * Load environment variables from .env
     */
    require('dotenv').load();
    process.env.NODE_ENV = 'production';

    const webpack = require('webpack');

    log('Building...');
    log('');
    webpack(config).run((err, stats) => {
      if (err) {
        reject([err]);
        if (report) {
          console.error(err);
          process.exit(1);
        }
      }

      const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats];

      statsArr.forEach((statsObj, i) => {
        log('');
        log(`Bundle #${i + 1}:`);
        log('');

        if (statsObj.compilation.errors.length) {
          reject(statsObj.compilation.errors);
          if (report) {
            log('Failed to compile.', statsObj.compilation.errors);
            process.exit(1);
          }
        }

        log(
          statsObj.toString({
            colors: true,
            children: false,
            chunks: false,
            modules: false,
            assetsSort: 'name',
          })
        );
      });
      log('');
      log('Build done!');
      resolve(statsArr);
    });
  });
};
