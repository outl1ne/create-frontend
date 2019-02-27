const detectPort = require('detect-port');
const getConfig = require('../../config');
const webpack = require('webpack');
const chalk = require('chalk');
const WebpackDevServer = require('webpack-dev-server');

require('dotenv').load();
process.env.NODE_ENV = 'development';

module.exports = () => {
  detectPort(getConfig('web').WEBPACK_PORT, (_, freePort) => {
    let watching = false;
    getClientDevServer(freePort, () => {
      if (!watching) {
        try {
          const serverCompiler = webpack(
            require('../../webpack/webpack.config.server')
          );
          serverCompiler.watch({}, stats => {
            console.log('stats', stats);
          });
        } catch (err) {
          console.log('err', err);
        }
      }
      watching = true;
    });
  });
};

function getClientDevServer(freePort, onDone) {
  const userConfig = getConfig('web');

  const defaultServerConf = {
    clientLogLevel: 'none',
    stats: 'minimal',
    port: freePort,
    inline: false,
    host: userConfig.WEBPACK_DOMAIN,
    publicPath: `${userConfig.WEBPACK_SERVER}/`,
    contentBase: `${userConfig.PUBLIC_DIRECTORY}`,
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
    https: userConfig.APP_PROTOCOL === 'https',
  };
  const serverConf =
    userConfig.EDIT_DEV_SERVER_CONFIG(defaultServerConf) || defaultServerConf;

  const compiler = webpack(require('../../webpack/webpack.config.client'));

  const devServer = new WebpackDevServer(compiler, serverConf).listen(
    freePort,
    userConfig.WEBPACK_DOMAIN,
    err => {
      if (err) {
        console.error('Dev server failed to start:', err);
        return;
      }

      console.info(
        chalk.green.bold(
          `=== Webpack dev server started at ${userConfig.APP_PROTOCOL}://${
            userConfig.WEBPACK_DOMAIN
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

  compiler.hooks.done.tap('CreateFrontendBuildDone', onDone);

  return devServer;
}
