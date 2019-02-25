const path = require('path');

module.exports = {
  default: {
    name: 'default',
    install: {},
    templatePath: path.resolve(__dirname, 'default'),
  },
  react: {
    name: 'react',
    install: {
      react: '^16.8.2',
      'react-dom': '^16.8.2',
    },
    mergeWithDefault: true,
    templatePath: path.resolve(__dirname, 'react'),
  },
};
