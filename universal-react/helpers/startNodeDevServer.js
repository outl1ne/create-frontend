/**
 * This is the node dev server entry point which runs after the compiler is done.
 *
 */
require('dotenv').load();
process.env.NODE_ENV = 'development';

const args = require('minimist')(process.argv);
const serverPath = args.src;
const getConfig = require('../../scripts/config');
const serverConfig = getConfig('node');

const serverPort = args.serverPort || serverConfig.DEFAULT_NODE_SERVER_PORT;

/**
 * Handle errors
 */
process.on('uncaughtException', err => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error(
    `${new Date().toUTCString()} unhandledRejection:`,
    err.message || err
  );
  console.error(err.stack);
  process.exit(1);
});

/**
 * Start server
 */
const server = require(serverPath).default;
server.listen(serverPort, () => {
  console.info(`✅  Server started at http://localhost:${serverPort}`);
});
