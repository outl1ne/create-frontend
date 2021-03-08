function BuildDonePlugin(cb) {
  this.cb = cb;
}

BuildDonePlugin.prototype.apply = function apply(compiler) {
  compiler.hooks.done.tap('BuildDonePlugin', () => this.cb());
};

module.exports = BuildDonePlugin;
