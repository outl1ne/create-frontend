module.exports = () => ({
  presets: [
    require.resolve('babel-preset-react'),
    [
      require.resolve('babel-preset-env'),
      {
        modules: false,
        targets: {
          browsers: ['last 2 versions', '> 1%', 'Safari >= 8'],
          uglify: true,
        },
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-react-display-name'),
  ],
  env: {
    test: {
      plugins: [
        require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
      ],
    },
    development: {
      plugins: [
        [
          require.resolve('babel-plugin-react-transform'),
          {
            transforms: [
              {
                transform: 'react-transform-catch-errors',
                imports: ['react', 'redbox-react'],
              },
            ],
          },
        ],
      ],
    },
  },
});
