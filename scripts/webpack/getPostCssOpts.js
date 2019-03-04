const getConfig = require('../config');

module.exports = async opts => {
  const config = await getConfig(opts.target);

  return {
    ident: 'postcss',
    sourceMap:
      (opts.IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS) || (!opts.IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS),
    plugins: [
      require('postcss-import')(),
      require('precss')(),
      require('autoprefixer')({
        browsers: config.BROWSERS_LIST,
      }),
    ],
  };
};
