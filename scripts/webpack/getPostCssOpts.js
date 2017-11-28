module.exports = () => {
  return {
    ident: 'postcss',
    sourceMap: true,
    plugins: [
      require('precss')(),
      require('autoprefixer')({
        browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
      }),
    ],
  };
};
