import http from 'http';
import detectPort from 'detect-port';

let app = require('./server').default;

const server = http.createServer(app);

let currentApp = app;

const SERVER_PORT = 3000;
detectPort(SERVER_PORT, (_, freePort) => {
  if (SERVER_PORT !== freePort) {
    if (__PRODUCTION__) {
      console.error(`❌  The port (${SERVER_PORT}) is not available. Please use a different port, such as ${freePort}`);
      return;
    }
    console.info(`⚠️  The port (${SERVER_PORT}) is not available. Using ${freePort} instead.`);
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
