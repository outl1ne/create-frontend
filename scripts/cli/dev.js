process.env.NODE_ENV = 'development';
require('dotenv').load();

/**
 * This function starts a webpack dev server.
 */
module.exports = async () => {
  const WebpackDevServer = require('webpack-dev-server');
  const getConfig = require('../config');
  const webpack = require('webpack');
  const chalk = require('chalk');
  const detectPort = require('detect-port');
  const getWebpackClientConfig = require('../webpack/webpack.config.client');
  const config = await getConfig('web');

  detectPort(config.WEBPACK_PORT, async (_, freePort) => {
    if (config.WEBPACK_PORT !== freePort) {
      console.error(
        `❌  The port (${
          config.WEBPACK_PORT
        }) is not available. You can choose another port by running "npm run dev -- --webpackPort=${freePort}"`
      );
      return;
    }

    const compiler = webpack(await getWebpackClientConfig());

    const defaultServerConf = {
      clientLogLevel: 'none',
      stats: 'minimal',
      port: config.WEBPACK_PORT,
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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      https: config.APP_PROTOCOL === 'https',
    };
    const serverConf = config.EDIT_DEV_SERVER_CONFIG(defaultServerConf) || defaultServerConf;

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
            `=== Webpack dev server started at ${config.APP_PROTOCOL}://${config.WEBPACK_DOMAIN}:${
              config.WEBPACK_PORT
            } ===
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
