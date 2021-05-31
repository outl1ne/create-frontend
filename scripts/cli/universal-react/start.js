process.env.NODE_ENV = 'production';
require('../../envLoader').config();
const http = require('http');
const detectPort = require('detect-port');

const getConfig = require('../../config');

module.exports = async () => {
  const serverConfig = await getConfig('node');

  /**
   * Handle errors
   */
  process.on('uncaughtException', err => {
    console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
    console.error(err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', err => {
    console.error(`${new Date().toUTCString()} unhandledRejection:`, err.message || err);
    console.error(err.stack);
    process.exit(1);
  });

  const serverPath = `${serverConfig.SERVER_BUILD_DIRECTORY}/${serverConfig.SERVER_OUTPUT_FILE}.js`;

  /**
   * Start server
   */
  const SERVER_PORT = +(process.env.SERVER_PORT || 8000);
  const freePort = await detectPort(SERVER_PORT);

  if (SERVER_PORT !== freePort) {
    throw new Error(
      `❌  The port (${SERVER_PORT}) is not available. Please use a different port - such as ${freePort} - by setting the SERVER_PORT environment value.`
    );
  }

  const libraryName = serverConfig.LIBRARY_NAME;
  const app = require(serverPath)[libraryName].default;
  const server = http.createServer(app);
  server.listen(freePort, error => {
    if (error) {
      console.error(`❌  Failed to start server`, error);
    }

    console.info(`✅  Server started at http://localhost:${freePort}`);
  });
};
