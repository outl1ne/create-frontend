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
  const chalk = require('chalk');
  const detectPort = require('detect-port');

  detectPort(config.WEBPACK_PORT, (_, freePort) => {
    if (config.WEBPACK_PORT !== freePort) {
      console.error(
        chalk.red.bold(
          `The port (${
            config.WEBPACK_PORT
          }) is not available. Pick an unused port such as ${
            freePort
          } by running "npm run dev -- --webpackPort=${freePort}"`
        )
      );
      return;
    }

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
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
      https: config.APP_PROTOCOL === 'https',
    };

    const devServer = new WebpackDevServer(compiler, serverConf).listen(
      config.WEBPACK_PORT,
      config.WEBPACK_DOMAIN,
      err => {
        if (err) {
          console.error('Dev server failed to start:', err);
          return;
        }

        console.info(
          chalk.green.bold(
            `\n=== Webpack dev server started. ===\nAssets are being server at: ${
              config.APP_PROTOCOL
            }://${config.WEBPACK_DOMAIN}:${config.WEBPACK_PORT}\n`
          )
        );

        function abort() {
          devServer.close();
          process.exit();
        }

        process.on('SIGINT', abort);
        process.on('SIGTERM', abort);
      }
    );
  });
};
