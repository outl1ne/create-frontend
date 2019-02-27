const getConfig = require('../config');

module.exports = opts => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        modules: false,
        targets: {
          browsers: getConfig(opts.target).BROWSERS_LIST,
        },
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-react-display-name'),
    require.resolve('@babel/plugin-transform-runtime'),
  ],
  env: {
    production: {
      plugins: [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
      ],
    },
    development: {
      plugins: [require.resolve('@babel/plugin-transform-react-jsx-source')],
    },
    test: {
      plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    },
  },
});
