const getConfig = require('../config');

module.exports = async opts => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        modules: false,
        targets: {
          browsers: await getConfig(opts.target).BROWSERS_LIST,
        },
        useBuiltIns: 'entry',
      },
    ],
    require.resolve('@emotion/babel-preset-css-prop'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-react-display-name'),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('babel-plugin-emotion'),
    [
      require.resolve('babel-plugin-inline-react-svg'),
      {
        svgo: {
          plugins: [
            {
              // Removing IDs might break logic if application
              // depends on paths having certain IDs
              cleanupIDs: false,
            },
          ],
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: [require.resolve('babel-plugin-transform-react-remove-prop-types')],
    },
    development: {
      plugins: [require.resolve('@babel/plugin-transform-react-jsx-source')],
    },
    test: {
      plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    },
  },
});
