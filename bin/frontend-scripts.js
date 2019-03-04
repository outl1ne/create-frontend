#!/usr/bin/env node

const args = process.argv.slice(2);
const script = args[0];
const parsedArgs = require('minimist')(args.slice(1, args.length));
const getWebpackClientConfig = require('../scripts/webpack/webpack.config.client');

switch (script) {
  case 'dev':
    require('../scripts/cli/dev')();
    break;
  case 'build':
    getWebpackClientConfig().then(webpackConfig => {
      require('../scripts/cli/build')(webpackConfig);
    });
    break;
  case 'build-universal-react':
    require('../scripts/cli/universal-react/build')();
    break;
  case 'dev-universal-react':
    require('../scripts/cli/universal-react/dev')(parsedArgs);
    break;
  case 'start-universal-react':
    require('../scripts/cli/universal-react/start')(parsedArgs);
    break;
  default:
    console.error(`Script not found: ${script}`);
    break;
}
