/**
 * This file is a TEMPLATE that contains logic for initializing the node server, and setting up hot reloading.
 * Because we need to import the user's server entry point here, which comes from a variable, we instead use
 * a placeholder called {{ USER_ENTRY_POINT }}. This will be filled in dynamically during the build process.
 */
import 'core-js/stable';
import http from 'http';
import detectPort from 'detect-port';
import envLoader from 'node_modules/@optimistdigital/create-frontend/scripts/envLoader';
envLoader.config({ reload: true });

const SERVER_PORT = +(process.env.SERVER_PORT || 8000);
let app = require('{{ USER_ENTRY_POINT }}').default;
const server = http.createServer(app);
let currentApp = app;

detectPort(SERVER_PORT, (_, freePort) => {
  if (SERVER_PORT !== freePort) {
    if (__PRODUCTION__) {
      console.error(
        `❌  The port (${SERVER_PORT}) is not available. Please use a different port - such as ${freePort} - by setting the SERVER_PORT environment value.`
      );
      return;
    }
    console.info(
      `⚠️  The port (${SERVER_PORT}) is not available. Using ${freePort} instead. To use a custom port, start the server with different SERVER_PORT environment value.`
    );
  }

  server.listen(freePort, error => {
    if (error) {
      console.error(`❌  Failed to start server`, error);
    }

    console.info(`✅  Server started at http://localhost:${freePort}`);
  });

  if (module.hot) {
    module.hot.accept('{{ USER_ENTRY_POINT }}', () => {
      try {
        app = require('{{ USER_ENTRY_POINT }}').default;
        server.removeListener('request', currentApp);
        server.on('request', app);
        currentApp = app;
      } catch (error) {
        console.error(`❌  Failed to apply hot reload`.error);
      }
    });
  }
});
