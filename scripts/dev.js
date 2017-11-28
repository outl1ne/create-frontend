/** @flow
 * This function starts a webpack production builds.
 */
module.exports = () => {
  /**
   * Load environment variables from .env
   */
  require('dotenv').load();
  process.env.NODE_ENV = 'development';

  const WebpackDevServer = require('webpack-dev-server');
  const config = require('./config');
  const webpack = require('webpack');

  const compiler = webpack(require('./webpack/webpack.config'));

  const serverConf = {
    clientLogLevel: 'none',
    stats: 'minimal',
    port: config.WEBPACK_PORT,
    inline: false,
    host: config.WEBPACK_DOMAIN,
    publicPath: `${config.WEBPACK_SERVER}/`,
    hot: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    https: config.APP_PROTOCOL === 'https',
  };

  const devServer = new WebpackDevServer(compiler, serverConf).listen(
    config.WEBPACK_PORT
  );
};
