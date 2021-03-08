process.env.NODE_ENV = 'development';
require('../../envLoader').config();

const detectPort = require('detect-port');
const getConfig = require('../../config');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { resolveApp } = require('../../paths');
const path = require('path');
const VirtualModulePlugin = require('webpack-virtual-modules');
const getWebpackClientConfig = require('../../webpack/webpack.config.client');
const getWebpackServerConfig = require('../../webpack/webpack.config.server');
const notifier = require('node-notifier');

module.exports = async () => {
  console.log('🚧  Starting dev server...');
  const userConfig = await getConfig('web');

  detectPort(userConfig.WEBPACK_PORT, (_, freePort) => {
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
        startNodeServer(styleInjectionPlugin);
        watching = true;
      } else {
        styleInjectionPlugin.writeModule(userConfig.STYLE_INJECTION_FILENAME, getStyleInjectionHack(importedStyles));
      }
    });
  });
};

async function startNodeServer(styleInjectionPlugin) {
  try {
    /**
     * Make a copy of the webpack config with extra node dev only plugins for injecting SSR styles
     */
    const config = {
      ...(await getWebpackServerConfig()),
    };
    config.plugins = [...(config.plugins || []), styleInjectionPlugin];
    const compiler = webpack(config);

    compiler.watch({}, (err, stats) => {
      const errors = err ? [err] : stats.compilation.errors;
      if (errors && errors.length > 0) {
        console.error('❌  Error during node dev server compilation', errors);

        notifier.notify({
          title: 'Build error',
          message: 'There was an error with the dev server. \nPlease check your terminal.',
        });
      }
    });
  } catch (err) {
    console.error('❌  Node dev server failed to start:', err);
  }
}

async function startClientServer(userConfig, onDone) {
  const defaultServerConf = {
    clientLogLevel: 'none',
    stats: 'minimal',
    port: userConfig.WEBPACK_PORT,
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
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    https: userConfig.APP_PROTOCOL === 'https',
  };
  const serverConf = userConfig.EDIT_DEV_SERVER_CONFIG(defaultServerConf) || defaultServerConf;

  const compiler = webpack(await getWebpackClientConfig());

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
        .filter(
          module => {
            return typeof module.resource === 'string' && /(?:css|scss|sass)$/.test(module.resource);
          }
        ).forEach(module => {
          importedStyles.add(module.resource)
        })
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
