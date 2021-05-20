const chalk = require('chalk');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-assets-manifest');
const webpack = require('webpack');
const getConfig = require('../config');
const getBabelOpts = require('./getBabelOpts');
const getPostCssOpts = require('./getPostCssOpts');
const readFiles = require('fs-readdir-recursive');
const HtmlPlugin = require('html-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('./plugins/StartServerPlugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { resolveApp } = require('../paths');
const VirtualModulePlugin = require('webpack-virtual-modules');
const createServerEntry = require('../../universal-react/server/createServerEntry');
const ESLintPlugin = require('eslint-webpack-plugin');
const BuildDonePlugin = require('./plugins/BuildDonePlugin');

/**
 * @param {string} target - webpack target (web/node)
 */
module.exports = async target => {
  const IS_PRODUCTION = process.env.NODE_ENV === 'production';
  const IS_WEB = target === 'web';
  const IS_NODE = target === 'node';
  const config = await getConfig(target);
  const WEBPACK_CONF_PARAMS = { IS_PRODUCTION, config, target };
  const OUTPUT_PATH = IS_NODE ? config.SERVER_BUILD_DIRECTORY : config.BUILD_DIRECTORY;
  const babelOpts = getBabelOpts();
  const postCssOpts = await getPostCssOpts(WEBPACK_CONF_PARAMS);
  const babelExcludes = /node_modules[\/\\](?!(@optimistdigital[\/\\]create-frontend)[\/\\]).*/; // Exclude everything except create-frontend code
  const nodeExternalsWhitelist = [
    'webpack/hot/poll?300',
    'webpack/hot/signal',
    /^@optimistdigital[\/\\]create-frontend[\/\\]universal-react.*/,
  ]; // Exclude everything except some hot reload logic, and create-frontend code
  const INTERNAL_SERVER_ENTRY_FILE = 'ocf-server-entry-point.js';

  const output = {};

  /**
   * Mode: production/development
   */
  output.mode = IS_PRODUCTION ? 'production' : 'development';

  /**
   * Target: Different for server/client
   */
  output.target = target;

  /**
   * Externals: Ignore node_modules in the bundle
   */
  if (IS_NODE) {
    output.externals = nodeExternals({
      allowlist: nodeExternalsWhitelist,
    });
  }

  /**
   * Devtool: Keep sourcemaps for development only.
   * This devtool is fast, but no column mappings.
   * Comparison: https://webpack.github.io/docs/build-performance.html#sourcemaps
   */
  if (IS_PRODUCTION) {
    output.devtool = IS_WEB && IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS ? 'source-map' : false;
  } else {
    output.devtool = IS_WEB && !IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS ? 'cheap-module-source-map' : false;
  }

  /**
   * Performance
   */
  output.performance = {
    maxEntrypointSize: 512 * 1024,
    maxAssetSize: 1024 * 1024,
  };

  /**
   * Optimization
   */
  if (IS_PRODUCTION && IS_WEB) {
    output.optimization = {
      emitOnErrors: false,
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', { colormin: false }],
          },
        }),
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            warnings: false,
            compress: {
              drop_console: false,
              pure_funcs: !config.IS_DEBUG
                ? ['console.debug', 'console.log', 'console.info', 'console.warn', 'console.table']
                : null,
            },
          },
        }),
      ],
    };
  } else {
    output.optimization = {
      minimize: false,
    };
  }

  /**
   * Context: Make context be root dir
   */
  output.context = config.APP_DIRECTORY;

  /**
   * Entry: Production uses separate entry points for CSS assets, development has only 1 bundle
   */

  const DEV_ENTRY_CONF = IS_NODE ? ['webpack/hot/poll?300'] : [];
  const DEV_ENTRY_POINTS = {};

  const entryPoints = IS_NODE ? { [config.SERVER_OUTPUT_FILE]: INTERNAL_SERVER_ENTRY_FILE } : config.ENTRY_POINTS;

  Object.keys(entryPoints).forEach(key => {
    DEV_ENTRY_POINTS[key] = [...DEV_ENTRY_CONF, entryPoints[key]];
  });

  output.entry = IS_PRODUCTION ? entryPoints : DEV_ENTRY_POINTS;

  /**
   * Output
   */
  output.output = {
    library: {
      type: IS_NODE ? 'commonjs2' : 'var',
      name: 'OCF',
    },
    path: OUTPUT_PATH,
    filename: IS_PRODUCTION && IS_WEB && config.HASH_FILENAMES ? '[name]-[chunkhash].js' : '[name].js',
    chunkFilename: '[name].js',
    publicPath: IS_PRODUCTION ? `/${config.BUILD_PATH}/` : `${config.WEBPACK_SERVER}/`,
  };

  /**
   * Resolve: We use the project root to import modules in JS absolutely, in addition to node_modules
   */

  output.resolve = {
    modules: ['node_modules', resolveApp('node_modules'), resolveApp('.')],
    extensions: ['.mjs', '.json', '.js', '.jsx', '.vue', '.css'],
    alias: {
      'webpack/hot/poll': require.resolve('webpack/hot/poll'),
    },
  };

  /**
   * Stats: In non-debug mode, we don't want to pollute the terminal with stats in case some errors would be missed
   */

  output.stats = config.IS_DEBUG ? 'verbose' : 'errors-only';

  /**
   * Loaders
   */
  function getStyleLoaders(additionalLoaders) {
    const loaders = [
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          esModule: false,
          sourceMap:
            (IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS) || (!IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS),
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: postCssOpts,
      },
      { loader: require.resolve('resolve-url-loader') }, // Resolves relative paths in url() statements based on the original source file.
      ...(additionalLoaders || []),
    ];

    if (IS_PRODUCTION) {
      if (IS_WEB) {
        loaders.unshift(ExtractPlugin.loader);
      }
    } else {
      loaders.unshift(
        IS_NODE
          ? // TODO: Go back to live version of isomorphic-style-loader when they fix React dependency
            // ? { loader: require.resolve('isomorphic-style-loader') }
            { loader: require.resolve('./loaders/isomorphic-style-loader') }
          : {
              loader: require.resolve('style-loader'),
              options: {
                esModule: false,
                attributes: {
                  // This id will be used to listen for load event
                  id: 'ocf-client-styles',
                },
              },
            }
      );
    }

    return loaders.filter(Boolean);
  }

  const developmentRules = [
    // JS
    {
      test: /\.(js|js|mjs)$/,
      exclude: babelExcludes,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: babelOpts,
        },
      ],
    },
    {
      test: /\.css/,
      use: getStyleLoaders(),
    },
    // SCSS
    {
      test: /\.(sass|scss)$/,
      use: getStyleLoaders([
        {
          loader: require.resolve('sass-loader'),
          options: {
            sassOptions: {
              outputStyle: 'expanded',
            },
            sourceMap: true, // resolve-url-loader always needs a sourcemap
          },
        },
      ]),
    },
  ];

  const productionRules = [
    // JS
    {
      test: /\.(js|js|mjs)$/,
      exclude: babelExcludes,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: babelOpts,
        },
      ],
    },
    // SCSS - extract from bundle with ExtractPlugin
    {
      test: /\.css/,
      use: getStyleLoaders(),
    },
    {
      test: /\.(sass|scss)$/,
      use: getStyleLoaders([
        {
          loader: require.resolve('sass-loader'),
          options: {
            sassOptions: {
              outputStyle: 'compressed',
            },
            sourceMap: true, // resolve-url-loader always needs a sourcemap
          },
        },
      ]),
    },
  ];

  output.module = {
    rules: [
      {
        oneOf: [
          ...(config.PREPEND_RULES(WEBPACK_CONF_PARAMS) || []),
          // Inline small images instead of creating separate assets
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              emitFile: IS_WEB,
              limit: 10000,
              name: config.HASH_FILENAMES ? '[name].[contenthash:8].[ext]' : '[name].[ext]',
            },
          },
          // Add production / development specific rules
          ...(IS_PRODUCTION ? productionRules : developmentRules),
          {
            test: [/\.html$/],
            loader: require.resolve('html-loader'),
            options: {},
          },
          // If nothing matched, use file-loader.
          // Except in the cases of js/json to allow webpack's default loaders to handle those.
          // This is currently deprecated in favor of asset modules: https://webpack.js.org/guides/asset-modules/
          // However, asset modules don't support emitFiles: false yet, needed for SSR, so we can't use that
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.js$/, /\.json$/],
            options: {
              emitFile: IS_WEB,
              name: config.HASH_FILENAMES ? '[name].[contenthash:8].[ext]' : '[name].[ext]',
            },
          },
        ],
      },
    ],
  };

  /**
   * Plugins: Some plugins are shared, others are specific to dev/prod
   */
  const PAGE_FILES = readFiles(config.HTML_PATH);
  output.plugins = [
    new ESLintPlugin({
      exclude: [
        config.STYLE_INJECTION_FILENAME,
        'node_modules',
        // This plugin doesn't work well with webpack-virtual-modules, so we will ignore the code from there
        // (it's not important for these files to be linted anyway)
        INTERNAL_SERVER_ENTRY_FILE,
      ],
    }),
    /* SHARED PLUGINS */
    ...PAGE_FILES.map(
      pageFile =>
        new HtmlPlugin(
          Object.assign({}, config.HTML_OPTIONS, {
            template: path.resolve(config.HTML_PATH, pageFile),
            // For production, we want the html to be generated into the public directory.
            // For development, we are serving the build directory, so we put the html there instead
            filename: IS_PRODUCTION
              ? path.join(
                  config.PUBLIC_DIRECTORY,
                  path.dirname(pageFile),
                  `${path.basename(pageFile, path.extname(pageFile))}.html`
                )
              : path.join(path.dirname(pageFile), `${path.basename(pageFile, path.extname(pageFile))}.html`),
          })
        )
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __TARGET__: JSON.stringify(target),
      __DEVELOPMENT__: !IS_PRODUCTION,
      __PRODUCTION__: IS_PRODUCTION,
      __DEBUG__: process.env.APP_DEBUG === 'true',
      __OCF_MANIFEST_PATH__: JSON.stringify(config.MANIFEST_PATH),
      __USE_STYLED_JSX__: config.USE_STYLED_JSX,
    }),
  ];

  /* SHARED WEB PLUGINS */
  if (IS_WEB) {
    output.plugins.push(
      new ManifestPlugin({
        output: config.MANIFEST_PATH,
        publicPath: true,
        writeToDisk: true,
        customize(entry) {
          if (entry.value.includes('.hot-update')) return false;

          return entry;
        },
      })
    );
  }

  /* PRODUCTION PLUGINS */
  if (IS_PRODUCTION) {
    output.plugins.push(
      new CleanWebpackPlugin(), // Clean previously built assets before making new bundle
      new ExtractPlugin({
        // Extract css files from bundles
        filename: config.HASH_FILENAMES ? '[name]-[contenthash].css' : '[name].css',
      })
    );
  }

  /* DEVELOPMENT PLUGINS */
  if (!IS_PRODUCTION) {
    const skipFirst = fn => {
      let skip = true;

      return () => {
        !skip && fn();
        skip = false;
      };
    };

    const logBuildDone = () => console.info(chalk.green.bold('\n=== Build for ' + target + ' done === \n'));

    output.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      // Skipping the first "build done" event in the node build, because the initial build is triggering the event
      // twice. There are some issues in github about it, but nothing conclusive.
      new BuildDonePlugin(IS_NODE ? skipFirst(logBuildDone) : logBuildDone)
    );

    /**
     * NODE DEVELOPMENT PLUGINS
     */
    if (IS_NODE) {
      output.plugins.push(
        /* Cleaning build directory in dev to prevent a billion useless hot-update files from piling up */
        new CleanWebpackPlugin(),
        new StartServerPlugin({
          name: `${config.SERVER_OUTPUT_FILE}.js`,
        })
      );
    }
  }

  /* NODE PLUGINS */
  if (IS_NODE) {
    output.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      })
    );

    // Add the virtual module that will add act as the server entry point
    output.plugins.push(
      new VirtualModulePlugin({
        [INTERNAL_SERVER_ENTRY_FILE]: createServerEntry(resolveApp(config.SERVER_ENTRY_POINT)),
      })
    );
  }

  /* USER DEFINED PLUGINS */
  output.plugins.push(...(config.APPEND_PLUGINS(WEBPACK_CONF_PARAMS) || []));

  // Falls back to default conf if replacer function returns a falsy value
  return config.EDIT_CONFIG(output, WEBPACK_CONF_PARAMS) || output;
};
