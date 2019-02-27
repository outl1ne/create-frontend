const getConfig = require('../../config');

module.exports = () => {
  /**
   * Initialize configuration
   */
  require('dotenv').load();
  process.env.NODE_ENV = 'production';

  /**
   * Handle errors
   */
  process.on('uncaughtException', err => {
    console.error(
      `${new Date().toUTCString()} uncaughtException:`,
      err.message
    );
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

  const serverConfig = getConfig('node');
  const serverPath = `${serverConfig.SERVER_BUILD_DIRECTORY}/${
    serverConfig.SERVER_OUTPUT_FILE
  }.js`;

  /**
   * Start server
   */
  require(serverPath);
};
