module.exports = async opts => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        corejs: opts.config.CORE_JS,
        modules: false,
        targets: opts.config.BROWSERS_LIST,
        useBuiltIns: 'entry',
      },
    ],
    opts.config.USE_EMOTION && require.resolve('@emotion/babel-preset-css-prop'),
  ].filter(Boolean),
  plugins: [
    require.resolve('babel-plugin-dev-expression'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-react-display-name'),
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        corejs: opts.config.CORE_JS,
      },
    ],
    opts.config.USE_EMOTION && require.resolve('babel-plugin-emotion'),
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
