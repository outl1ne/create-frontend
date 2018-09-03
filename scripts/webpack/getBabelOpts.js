module.exports = () => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-flow'),
    [
      require.resolve('@babel/preset-env'),
      {
        modules: false,
        targets: {
          browsers: ['last 2 versions', '> 1%', 'Safari >= 8'],
        },
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-react-display-name'),
  ],
  env: {
    test: {
      plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    },
    development: {
      plugins: [
        [
          require.resolve('babel-plugin-react-transform'),
          {
            transforms: [
              {
                transform: require.resolve('react-transform-catch-errors'),
                imports: ['react', require.resolve('redbox-react')],
              },
            ],
          },
        ],
      ],
    },
  },
});
