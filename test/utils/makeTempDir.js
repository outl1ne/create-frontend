const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = function makeTempDir() {
  return new Promise((resolve, reject) => {
    tmp.dir(
      {
        unsafeCleanup: true,
      },
      (err, path, cleanup) => {
        if (err) return reject(err);
        return resolve({ path, cleanup });
      }
    );
  });
};
