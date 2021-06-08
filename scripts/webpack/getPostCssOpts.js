const getConfig = require('../config');

module.exports = async opts => {
  const config = await getConfig(opts.target);

  return {
    sourceMap:
      (opts.IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS) || (!opts.IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS),
    postcssOptions: {
      plugins: [require('postcss-flexbugs-fixes')(), require('postcss-import')(), require('autoprefixer')()],
    },
  };
};
