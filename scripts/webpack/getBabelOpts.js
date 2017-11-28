module.exports = () => ({
  presets: [
    'react',
    [
      'env',
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
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-react-display-name',
  ],
  env: {
    test: {
      plugins: ['transform-es2015-modules-commonjs'],
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
