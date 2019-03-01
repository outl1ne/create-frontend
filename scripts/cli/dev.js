/**
 * This function starts a webpack production builds.
 */
module.exports = () => {
  /**
   * Load environment variables from .env
   */
  require('dotenv').load();
  process.env.NODE_ENV = 'development';

  const WebpackDevServer = require('webpack-dev-server');
  const getConfig = require('../config');
  const webpack = require('webpack');
  const chalk = require('chalk');
  const detectPort = require('detect-port');
  const config = getConfig('web');

  detectPort(config.WEBPACK_PORT, (_, freePort) => {
    if (config.WEBPACK_PORT !== freePort) {
      console.info(
        chalk.yellow.bold(
          `The port (${
            config.WEBPACK_PORT
          }) is not available. Using ${freePort} instead. You can choose a custom port by running "npm run dev -- --webpackPort=customPort"`
        )
      );
    }

    const compiler = webpack(require('../webpack/webpack.config.client'));

    const defaultServerConf = {
      clientLogLevel: 'none',
      stats: 'minimal',
      port: freePort,
      inline: false,
      host: config.WEBPACK_DOMAIN,
      publicPath: `${config.WEBPACK_SERVER}/`,
      contentBase: `${config.PUBLIC_DIRECTORY}`,
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
    const serverConf =
      config.EDIT_DEV_SERVER_CONFIG(defaultServerConf) || defaultServerConf;

    const devServer = new WebpackDevServer(compiler, serverConf).listen(
      freePort,
      config.WEBPACK_DOMAIN,
      err => {
        if (err) {
          console.error('Dev server failed to start:', err);
          return;
        }

        console.info(
          chalk.green.bold(
            `=== Webpack dev server started at ${config.APP_PROTOCOL}://${
              config.WEBPACK_DOMAIN
            }:${freePort} ===
=== Building... ===`
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
