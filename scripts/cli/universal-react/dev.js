process.env.NODE_ENV = 'development';
require('../../envLoader').config();

const detectPort = require('detect-port');
const getConfig = require('../../config');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const VirtualModulePlugin = require('webpack-virtual-modules');
const getWebpackClientConfig = require('../../webpack/webpack.config.client');
const getWebpackServerConfig = require('../../webpack/webpack.config.server');
const nodeDevServer = require('../../webpack/nodeDevServer');

module.exports = async () => {
  console.log('🚧  Starting dev server...');
  const userConfig = await getConfig('web');

  const freePort = await detectPort(userConfig.WEBPACK_PORT);

  if (userConfig.WEBPACK_PORT !== freePort) {
    console.error(
      `❌  The port (${userConfig.WEBPACK_PORT}) is not available. You can choose another port by running "npm run dev -- --webpackPort=${freePort}"`
    );
    return;
  }

  let watching = false;
  let styleInjectionPlugin;

  startClientServer(userConfig, importedStyles => {
    if (!watching) {
      styleInjectionPlugin = new VirtualModulePlugin({
        [userConfig.STYLE_INJECTION_FILENAME]: getStyleInjectionHack(importedStyles),
      });
      startNodeServer(userConfig, styleInjectionPlugin);
      watching = true;
    } else {
      styleInjectionPlugin.writeModule(userConfig.STYLE_INJECTION_FILENAME, getStyleInjectionHack(importedStyles));
    }
  });
};

async function startNodeServer(userConfig, styleInjectionPlugin) {
  const config = {
    ...(await getWebpackServerConfig()),
  };
  config.plugins = [...(config.plugins || []), styleInjectionPlugin];
  const compiler = webpack(config);
  await nodeDevServer.init(compiler, userConfig.SERVER_OUTPUT_FILE + '.js', {
    poll: 300,
    ignored: ['**/node_modules', '**/' + userConfig.STYLE_INJECTION_FILENAME],
  });
}

async function startClientServer(userConfig, onDone) {
  const defaultServerConf = {
    clientLogLevel: 'none',
    stats: 'minimal',
    port: userConfig.WEBPACK_PORT,
    inline: true,
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
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    https: userConfig.APP_PROTOCOL === 'https',
  };
  const serverConf = userConfig.EDIT_DEV_SERVER_CONFIG(defaultServerConf) || defaultServerConf;

  const webpackConfig = await getWebpackClientConfig();

  const compiler = webpack(webpackConfig);

  const devServer = new WebpackDevServer(compiler, serverConf).listen(
    userConfig.WEBPACK_PORT,
    userConfig.WEBPACK_DOMAIN,
    err => {
      if (err) {
        console.error('Dev server failed to start:', err);
        return;
      }

      function abort() {
        devServer.close();
        process.exit();
      }

      process.on('SIGINT', abort);
      process.on('SIGTERM', abort);
    }
  );

  /**
   * Hooks into Webpack and gets all of the imported style paths,
   * so we can pass them to the node dev server, and inject to document head to prevent FOUC
   * "emit" hook happens before "done", so we can collect these here and pass them to the callback
   */
  let importedStyles = new Set();
  compiler.hooks.emit.tap('OCFWebBuildEmit', compilation => {
    // Clear the array of stuff from previous emit
    importedStyles = new Set();
    compilation.chunks.forEach(chunk => {
      compilation.chunkGraph
        .getChunkModules(chunk)
        .filter(module => {
          return typeof module.resource === 'string' && /(?:css|scss|sass)$/.test(module.resource);
        })
        .forEach(module => {
          importedStyles.add(module.resource);
        });
    });
  });

  compiler.hooks.done.tap('OCFWebBuildDone', () => {
    onDone(Array.from(importedStyles));
  });

  return devServer;
}

function getStyleInjectionHack(importedStyles) {
  return `const styles = []; ${importedStyles
    .map(
      stylePath =>
        `styles.push(require('${stylePath.replace(
          new RegExp(path.sep.repeat(2), 'g'),
          path.sep.repeat(2)
        )}')._getCss())`
    )
    .join(';')}; module.exports = styles;`;
}
