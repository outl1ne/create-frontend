const semver = require('semver');
const { resolveApp } = require('./scripts/paths');
const pkg = require(resolveApp('package.json'));
const corejs = pkg.dependencies['core-js'] ? semver.coerce(pkg.dependencies['core-js']).major : undefined;

module.exports = {
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        corejs,
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
    [require.resolve('@babel/plugin-transform-runtime'), { regenerator: true }],
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
};
