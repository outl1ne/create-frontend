const execa = require('execa');

/**
 * Starts create-frontend dev server in the selected path. Resolves once the dev server has started
 */
module.exports = function startDevServer(cwd, waitForOutput) {
  return new Promise((resolve, reject) => {
    // Start dev script
    const subprocess = execa('npm', ['run', 'dev'], { cwd });

    const output = {};

    const cleanup = () => {
      subprocess.stdout.off('data', dataReceived);
      return subprocess.kill('SIGINT');
    };
    global.cleanupFunctions.push(cleanup);

    const dataReceived = chunk => {
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
    };

    subprocess.stdout.on('data', dataReceived);

    // If the process ended without the correct stdout, it means something went wrong
    subprocess.then(() => {
      reject({
        error: 'Finished npm script without successfully starting dev server',
        stdout: subprocess.stdout,
      });
    });
  });
};
