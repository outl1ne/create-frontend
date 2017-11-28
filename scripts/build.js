/** @flow
 * This function starts a webpack production builds.
 */
module.exports = () => {
  /**
   * Load environment variables from .env
   */
  require('dotenv').load();
  process.env.NODE_ENV = 'production';

  const webpack = require('webpack');

  console.log('Building...');
  console.log('');
  webpack(require('./webpack/webpack.config')).run((err, stats) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const statsArr = Array.isArray(stats.stats) ? stats.stats : [stats];

    statsArr.forEach((statsObj, i) => {
      console.log('');
      console.log(`Bundle #${i + 1}:`);
      console.log('');

      if (statsObj.compilation.errors.length) {
        console.log('Failed to compile.', statsObj.compilation.errors);
        process.exit(1);
      }

      console.log(
        statsObj.toString({
          colors: true,
          children: false,
          chunks: false,
          modules: false,
          assetsSort: 'name',
        })
      );
    });
    console.log('');
    console.log('Build done!');
  });
};
