const chalk = require('chalk');
const CleanPlugin = require('clean-webpack-plugin');
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
const StartServerPlugin = require('start-server-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { resolveApp } = require('../paths');

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
  const babelOpts = await getBabelOpts(WEBPACK_CONF_PARAMS);
  const postCssOpts = await getPostCssOpts(WEBPACK_CONF_PARAMS);
  const babelExcludes = /node_modules\/(?!(@optimistdigital\/create-frontend)\/).*/; // Exclude everything except create-frontend code
  const nodeExternalsWhitelist = ['webpack/hot/poll?300', /^@optimistdigital\/create-frontend\/universal-react.*/]; // Exclude everything except some hot reload logic, and create-frontend code

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
      whitelist: nodeExternalsWhitelist,
    });
  }

  /* Enable watch mode in dev node server */
  if (IS_NODE && !IS_PRODUCTION) {
    output.watch = true;
  }

  /**
   * Devtool: Keep sourcemaps for development only.
   * This devtool is fast, but no column mappings.
   * Comparison: https://webpack.github.io/docs/build-performance.html#sourcemaps
   */
  if (IS_PRODUCTION) {
    output.devtool = IS_WEB && IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS ? 'source-map' : false;
  } else {
    output.devtool = IS_WEB && !IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS ? 'eval-cheap-module-source-map' : false;
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
      minimize: true,
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: config.ENABLE_PROD_SOURCEMAPS,
          terserOptions: {
            warnings: false,
            drop_console: IS_WEB && !config.IS_DEBUG,
          },
        }),
        new OptimizeCssAssetsPlugin({}),
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

  const DEV_ENTRY_CONF = IS_NODE
    ? ['webpack/hot/poll?300']
    : [
        `${require.resolve('webpack-dev-server/client')}?${config.WEBPACK_SERVER}`,
        require.resolve('webpack/hot/only-dev-server'),
      ];

  const DEV_ENTRY_POINTS = {};

  const entryPoints = IS_NODE ? { [config.SERVER_OUTPUT_FILE]: config.SERVER_ENTRY_POINT } : config.ENTRY_POINTS;

  Object.keys(entryPoints).forEach(key => {
    DEV_ENTRY_POINTS[key] = [...DEV_ENTRY_CONF, entryPoints[key]];
  });

  output.entry = IS_PRODUCTION ? entryPoints : DEV_ENTRY_POINTS;

  /**
   * Output
   */
  output.output = {
    libraryTarget: IS_NODE ? 'commonjs2' : 'var',
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
          ? { loader: require.resolve('isomorphic-style-loader') }
          : {
              loader: require.resolve('style-loader'),
              options: {
                attrs: {
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
        { loader: require.resolve('eslint-loader') },
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
            outputStyle: 'expanded',
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
            outputStyle: 'compressed',
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
              name: config.HASH_FILENAMES ? '[name].[hash:8].[ext]' : '[name].[ext]',
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
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.js$/, /\.json$/],
            options: {
              emitFile: IS_WEB,
              name: config.HASH_FILENAMES ? '[name].[hash:8].[ext]' : '[name].[ext]',
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
    }),
  ];

  /* SHARED WEB PLUGINS */
  if (IS_WEB) {
    output.plugins.push(
      new ManifestPlugin({
        output: config.MANIFEST_PATH,
        publicPath: true,
        writeToDisk: true,
      })
    );
  }

  /* PRODUCTION PLUGINS */
  if (IS_PRODUCTION) {
    output.plugins.push(
      new CleanPlugin([OUTPUT_PATH], {
        root: config.APP_DIRECTORY,
        verbose: false,
      }), // Clean previously built assets before making new bundle
      new webpack.IgnorePlugin(/\.\/dev/, /\/config$/), // Ignore dev config
      new ExtractPlugin({
        // Extract css files from bundles
        filename: config.HASH_FILENAMES ? '[name]-[contenthash].css' : '[name].css',
      })
    );
  }

  /* DEVELOPMENT PLUGINS */
  if (!IS_PRODUCTION) {
    output.plugins.push(
      new webpack.NamedModulesPlugin(), // Named modules for HMR
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new (require('./plugins/BuildDonePlugin'))(chalk.green.bold('\n=== Build for ' + target + ' done === \n'))
    );

    /**
     * NODE DEVELOPMENT PLUGINS
     */
    if (IS_NODE) {
      output.plugins.push(
        /* Cleaning build directory in dev to prevent a billion useless hot-update files from piling up */
        new CleanPlugin([OUTPUT_PATH], {
          root: config.APP_DIRECTORY,
          verbose: false,
        }),
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
  }

  /* USER DEFINED PLUGINS */
  output.plugins.push(...(config.APPEND_PLUGINS(WEBPACK_CONF_PARAMS) || []));

  // Falls back to default conf if replacer function returns a falsy value
  return config.EDIT_CONFIG(output, WEBPACK_CONF_PARAMS) || output;
};
