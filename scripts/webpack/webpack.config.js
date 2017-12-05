const chalk = require('chalk');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-plugin-manifest');
const webpack = require('webpack');
const paths = require('../paths');
const config = require('../config');
const getBabelOpts = require('./getBabelOpts');
const getPostCssOpts = require('./getPostCssOpts');

/**
 * Set NODE_ENV to production as a fallback, if it hasn't been set by something else
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Target: Different for server/client
 */
module.exports.target = 'web';

/**
 * Devtool: Keep sourcemaps for development only.
 * This devtool is fast, but no column mappings.
 * Comparison: https://webpack.github.io/docs/build-performance.html#sourcemaps
 */
if (IS_PRODUCTION) {
  module.exports.devtool =
    IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS ? 'source-map' : false;
} else {
  module.exports.devtool =
    !IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS
      ? 'eval-cheap-module-source-map'
      : false;
}

/**
 * Context: Make context be root dir
 */
module.exports.context = paths.APP_DIRECTORY;

/**
 * Entry: Production uses separate entry points for CSS assets, development has only 1 bundle
 */

const DEV_ENTRY_CONF = [
  `${require.resolve('webpack-dev-server/client')}?${config.WEBPACK_SERVER}`,
  require.resolve('webpack/hot/only-dev-server'),
];

const DEV_ENTRY_POINTS = {};

Object.keys(config.ENTRY_POINTS).forEach(key => {
  DEV_ENTRY_POINTS[key] = [...DEV_ENTRY_CONF, config.ENTRY_POINTS[key]];
});

module.exports.entry = IS_PRODUCTION ? config.ENTRY_POINTS : DEV_ENTRY_POINTS;

/**
 * Output
 */
module.exports.output = {
  path: paths.BUILD_DIRECTORY,
  filename:
    IS_PRODUCTION && config.HASH_FILENAMES
      ? '[name]-[chunkhash].js'
      : '[name].js',
  chunkFilename: '[name].js',
  publicPath: IS_PRODUCTION
    ? `/${paths.BUILD_PATH}/`
    : `${config.WEBPACK_SERVER}/`,
};

/**
 * Resolve: We use the project root to import modules in JS absolutely, in addition to node_modules
 */

module.exports.resolve = {
  modules: ['.', 'node_modules'],
  extensions: ['.json', '.js'],
};

/**
 * Stats: In non-debug mode, we don't want to pollute the terminal with stats in case some errors would be missed
 */

module.exports.stats = config.IS_DEBUG ? 'verbose' : 'errors-only';

/**
 * Module: Mainly for loaders. Some loaders are shared, others are specific to dev/prod
 */

const developmentRules = [
  // JS
  {
    test: /\.(js|js|mjs)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: getBabelOpts(),
      },
      { loader: require.resolve('eslint-loader') },
    ],
  },
  // SCSS
  {
    test: /\.(sass|scss)$/,
    use: [
      { loader: require.resolve('style-loader') },
      {
        loader: require.resolve('css-loader'),
        options: { importLoaders: 1, sourceMap: config.ENABLE_DEV_SOURCEMAPS },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: getPostCssOpts({ IS_PRODUCTION, config }),
      },
      { loader: require.resolve('resolve-url-loader') }, // Resolves relative paths in url() statements based on the original source file.
      {
        loader: require.resolve('sass-loader'),
        options: {
          outputStyle: 'expanded',
          sourceMap: true, // resolve-url-loader always needs a sourcemap
        },
      },
    ],
  },
];

const productionRules = [
  // JS
  {
    test: /\.(js|js|mjs)$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: getBabelOpts(),
      },
    ],
  },
  // SCSS - extract from bundle with ExtractTextPlugin
  {
    test: /\.(sass|scss)$/,
    use: ExtractTextPlugin.extract({
      fallback: require.resolve('style-loader'),
      use: [
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 1,
            sourceMap: config.ENABLE_PROD_SOURCEMAPS,
            minimize: true,
          },
        },
        {
          loader: require.resolve('postcss-loader'),
          options: getPostCssOpts({ IS_PRODUCTION, config }),
        },
        { loader: require.resolve('resolve-url-loader') }, // Resolves relative paths in url() statements based on the original source file.
        {
          loader: require.resolve('sass-loader'),
          options: {
            outputStyle: 'compressed',
            sourceMap: true, // resolve-url-loader always needs a sourcemap
          },
        },
      ],
    }),
  },
];

module.exports.module = {
  rules: [
    {
      oneOf: [
        ...(config.getRules({ IS_PRODUCTION }) || []),
        // Inline small images instead of creating separate assets
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: config.HASH_FILENAMES
              ? '[name].[hash:8].[ext]'
              : '[name].[ext]',
          },
        },
        // Add production / development specific rules
        ...(IS_PRODUCTION ? productionRules : developmentRules),
        // If nothing matched, use file-loader.
        // Except in the cases of js/html/json to allow webpack's default loaders to handle those.
        {
          loader: require.resolve('file-loader'),
          exclude: [/\.js$/, /\.html$/, /\.json$/],
          options: {
            name: config.HASH_FILENAMES
              ? '[name].[hash:8].[ext]'
              : '[name].[ext]',
          },
        },
      ],
    },
  ],
};

/**
 * Plugins: Some plugins are shared, others are specific to dev/prod
 */

module.exports.plugins = [
  /* SHARED PLUGINS */
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
    __DEVELOPMENT__: !IS_PRODUCTION,
    __PRODUCTION__: IS_PRODUCTION,
    __DEBUG__: process.env.APP_DEBUG === 'true',
  }),
  new ManifestPlugin({
    fileName: 'asset-manifest.json',
    prettyPrint: true,
    path: paths.APP_DIRECTORY,
  }),
  ...(config.IS_DEBUG
    ? [
        new (require('webpack-visualizer-plugin'))({
          filename: './stats.html',
        }),
      ]
    : []),
  ...(IS_PRODUCTION
    ? [
        /* PRODUCTION PLUGINS */
        new CleanPlugin([paths.BUILD_DIRECTORY], { root: paths.APP_DIRECTORY }), // Clean previously built assets before making new bundle
        new webpack.IgnorePlugin(/\.\/dev/, /\/config$/), // Ignore dev config
        new ExtractTextPlugin({
          // Extract css files from bundles
          filename: config.HASH_FILENAMES
            ? '[name]-[contenthash].css'
            : '[name].css',
          allChunks: true,
        }),
        new webpack.optimize.UglifyJsPlugin({
          // Minify JS
          minimize: true,
          compress: { warnings: false, drop_console: !config.IS_DEBUG },
          mangle: { screw_ie8: true },
          output: { comments: false, screw_ie8: true },
          comments: false,
          sourceMap: config.ENABLE_PROD_SOURCEMAPS,
        }),
      ]
    : [
        /* DEVELOPMENT PLUGINS */
        new webpack.NamedModulesPlugin(), // Named modules for HMR
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new (require('./plugins/BuildDonePlugin'))(
          chalk.green.bold('\n=== Client build done === \n')
        ),
      ]),
  ...(config.getPlugins({
    IS_PRODUCTION,
  }) || []),
];
