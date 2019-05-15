const execa = require('execa');

/**
 * Starts create-frontend dev server in the selected path. Resolves once the dev server has started
 */
module.exports = function startDevServer(cwd) {
  return new Promise((resolve, reject) => {
    // Start dev script
    const subprocess = execa('npm', ['run', 'dev'], { cwd });

    // Define variables that will capture stdout
    let devServerMessage;
    let buildDoneMessage;

    const dataReceived = chunk => {
      const data = chunk.toString();

      if (data.match(/webpack dev server started at/i)) devServerMessage = data;
      if (data.match(/build for web done/i)) buildDoneMessage = data;

      if (devServerMessage && buildDoneMessage) {
        resolve({
          url: devServerMessage.match(/https?:\/\/.*:(?:\d)+/)[0],
          cleanup: () => {
            subprocess.stdout.off('data', dataReceived);
            return subprocess.kill();
          },
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
