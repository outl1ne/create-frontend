module.exports = ({ config = {} } = {}) => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        corejs: config.CORE_JS,
        modules: false,
        useBuiltIns: 'entry',
      },
    ],
  ].filter(Boolean),
  plugins: [
    require.resolve('babel-plugin-dev-expression'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-react-display-name'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        corejs: config.CORE_JS,
      },
    ],
  ].filter(Boolean),
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
