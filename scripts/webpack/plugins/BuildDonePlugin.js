function BuildDonePlugin(cb) {
  this.cb = cb;
}

BuildDonePlugin.prototype.apply = function apply(compiler) {
  compiler.hooks.done.tap('BuildDonePlugin', stats => {
    if (!stats.hasErrors() && !stats.hasWarnings()) {
      this.cb();
    }
  });
};

module.exports = BuildDonePlugin;
