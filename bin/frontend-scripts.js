#!/usr/bin/env node
require('dotenv').load();

const args = process.argv.slice(2);
const script = args[0];
const parsedArgs = require('minimist')(args.slice(1, args.length));
const getWebpackClientConfig = require('../scripts/webpack/webpack.config.client');

switch (script) {
  case 'dev': {
    process.env.NODE_ENV = 'development';
    require('../scripts/cli/dev')();
    break;
  }
  case 'build': {
    process.env.NODE_ENV = 'production';
    getWebpackClientConfig().then(webpackConfig => {
      require('../scripts/cli/build')(webpackConfig);
    });
    break;
  }
  case 'build-universal-react': {
    process.env.NODE_ENV = 'production';
    require('../scripts/cli/universal-react/build')();
    break;
  }
  case 'dev-universal-react': {
    process.env.NODE_ENV = 'development';
    require('../scripts/cli/universal-react/dev')(parsedArgs);
    break;
  }
  case 'start-universal-react': {
    process.env.NODE_ENV = 'production';
    require('../scripts/cli/universal-react/start')(parsedArgs);
    break;
  }
  default: {
    console.error(`Script not found: ${script}`);
    break;
  }
}
