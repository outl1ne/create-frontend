const { createFsFromVolume, Volume } = require('memfs');
const nodeEval = require('eval');
const notifier = require('node-notifier');
const http = require('http');
const detectPort = require('detect-port');

/**
 * Returns an available port. Tries to use the SERVER_PORT env variable if available.
 */
async function getPort() {
  const SERVER_PORT = +(process.env.SERVER_PORT || 8000);
  const freePort = await detectPort(SERVER_PORT);

  if (SERVER_PORT !== freePort) {
    console.info(
      `⚠️  The port (${SERVER_PORT}) is not available. Using ${freePort} instead. To use a custom port, start the server with different SERVER_PORT environment value.`
    );
  }

  return freePort;
}

/**
 * Creates an empty server that doesn't do anything
 */
async function createServer() {
  return new Promise((resolve, reject) => {
    getPort()
      .then(port => {
        const server = http.createServer(() => null);
        server.listen(port, error => {
          if (error) {
            console.error(`❌  Failed to start server`, error);
            reject(error);
            return;
          }

          console.info(`✅  Server started at http://localhost:${port}`);
          resolve(server);
        });
      })
      .catch(reject);
  });
}

/**
 * Updates the request listener for the given server.
 */
function updateServer(server, previousApp, app) {
  if (previousApp) {
    server.removeListener('request', previousApp);
  }
  server.on('request', app);
}

/**
 * Initializes a self updating dev server for the given webpack compiler.
 */
module.exports.init = async (compiler, fileName, watchOptions = {}) => {
  const vol = new Volume();
  const fs = createFsFromVolume(vol);
  compiler.outputFileSystem = fs;
  const server = await createServer();
  let app;

  compiler.watch(watchOptions, (err, stats) => {
    const errors = err ? [err] : stats.compilation.errors;
    if (errors && errors.length > 0) {
      console.error('❌  Error during node dev server compilation', errors);

      notifier.notify({
        title: 'Build error',
        message: 'There was an error with the dev server. \nPlease check your terminal.',
      });
    } else {
      const filePath = `${stats.compilation.options.output.path}/${fileName}`;
      try {
        const source = fs.readFileSync(filePath, 'utf-8');
        const libraryName = compiler.options.output.library.name;
        const previousApp = app;
        app = nodeEval(source, fileName, {}, true)[libraryName].default;
        updateServer(server, previousApp, app);
      } catch (startupError) {
        console.error('❌  Error during node dev server startup', startupError);
        notifier.notify({
          title: 'Server error',
          message: 'There was an error with the dev server. \nPlease check your terminal.',
        });
      }
    }
  });
};
