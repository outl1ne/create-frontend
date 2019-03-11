process.env.NODE_ENV = 'production';
require('dotenv').load();

const build = require('../build');
const getWebpackClientConfig = require('../../webpack/webpack.config.client');
const getWebpackServerConfig = require('../../webpack/webpack.config.server');

module.exports = async () => {
  console.log('🚧  Building Universal React App...');
  console.log('');

  const [clientConf, serverConf] = await Promise.all([getWebpackClientConfig(), getWebpackServerConfig()]);

  try {
    const [clientStats, serverStats] = await Promise.all([build(clientConf, false), build(serverConf, false)]);

    logStats(clientStats, 'Client');
    logStats(serverStats, 'Server');

    console.log('');
    console.log(`✅  Build done!`);
  } catch (err) {
    (Array.isArray(err) ? err : [err]).forEach(error => {
      console.error('❌  Error while trying to build:', error);
      process.exit(1);
    });
  }
};

function logStats(stats, name) {
  stats.forEach((statsObj, i) => {
    console.log('');
    console.log(`${name} bundle #${i + 1}:`);
    console.log('');

    if (statsObj.compilation.errors.length) {
      console.error('❌  Failed to compile.', statsObj.compilation.errors);
      process.exit(1);
    }

    console.log(
      statsObj.toString({
        colors: true,
        children: false,
        chunks: false,
        modules: false,
        version: false,
        hash: false,
        assetsSort: 'name',
      })
    );
  });
}
