const cluster = require('cluster');
const path = require('path');

/**
 * Starts a new cluster which will serve the node application
 */
class DevNodeServer {
  constructor(assetName, args) {
    this.worker = null;
    this.args = args || null;
    this.assetName = assetName;
  }

  startOnce(compilation, callback) {
    if (this.worker && this.worker.isConnected()) {
      callback();
    } else {
      this.start(compilation, callback);
    }
  }

  start(compilation, callback) {
    const { existsAt } = compilation.assets[this.assetName];

    cluster.setupMaster({
      exec: path.resolve(__dirname, 'startNodeDevServer.js'),
      args: [`--src=${existsAt}`, ...this.getArgs()],
      execArgv: process.execArgv,
    });

    cluster.on('online', worker => {
      this.worker = worker;
      callback();
    });

    cluster.fork();
  }

  getArgs() {
    const args = [...process.execArgv];

    if (Array.isArray(this.args)) {
      args.push.apply(args, this.args);
    } else if (typeof this.args === 'object') {
      const { _, ...namedArgs } = this.args;
      args.push.apply(args, _);
      Object.entries(namedArgs).forEach(([key, value]) => {
        args.push(`--${key}=${value}`);
      });
    }
    return args;
  }
}

module.exports = DevNodeServer;
