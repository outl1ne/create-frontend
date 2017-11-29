module.exports = ({ IS_PRODUCTION, config }) => ({
  ident: 'postcss',
  sourceMap:
    (IS_PRODUCTION && config.ENABLE_PROD_SOURCEMAPS) ||
    (!IS_PRODUCTION && config.ENABLE_DEV_SOURCEMAPS),
  plugins: [
    require('precss')(),
    require('autoprefixer')({
      browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
    }),
  ],
});
