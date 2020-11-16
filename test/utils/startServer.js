const execa = require('execa');

/**
 * Starts create-frontend server in the selected path. Resolves once the server has started
 */
module.exports = function startServer(cwd, command = 'start', waitForOutput) {
  return new Promise((resolve, reject) => {
    const subprocess = execa('npm', ['run', command], { cwd });

    const output = {};

    const cleanup = () => {
      return new Promise(res => {
        subprocess.on('close', () => {
          res();
        });

        subprocess.stdout.removeAllListeners('data');
        subprocess.stderr.removeAllListeners('data');
        subprocess.kill();
      });
    };
    global.cleanupFunctions.push(cleanup);

    subprocess.stdout.on('data', chunk => {
      const data = chunk.toString();

      Object.entries(waitForOutput).forEach(([name, regex]) => {
        if (data.match(regex)) output[name] = data;
      });

      if (Object.keys(output).length === Object.keys(waitForOutput).length) {
        resolve({
          output,
          cleanup,
        });
      }
    });

    subprocess.stderr.on('data', chunk => {
      const data = chunk.toString();

      console.error('Error while starting server:', data);
    });

    // If the process ended without the correct stdout, it means something went wrong
    subprocess
      .then(() => {
        if (!subprocess.killed) {
          reject({
            error: 'Finished npm script without successfully starting server',
            stdout: subprocess.stdout,
          });
        }
      })
      .catch(error => {
        reject({
          error,
        });
      });
  });
};
