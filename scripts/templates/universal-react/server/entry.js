/**
 * This file starts up the server, and sets up hot reload in development.
 * All application specific code should be added in server/server.js
 */
import '@babel/polyfill';
import http from 'http';
import detectPort from 'detect-port';

const SERVER_PORT = +(process.env.SERVER_PORT || 8000);
let app = require('./server').default;
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
    module.hot.accept('./server', () => {
      try {
        app = require('./server').default;
        server.removeListener('request', currentApp);
        server.on('request', app);
        currentApp = app;
      } catch (error) {
        console.error(`❌  Failed to apply hot reload`.error);
      }
    });
  }
});
