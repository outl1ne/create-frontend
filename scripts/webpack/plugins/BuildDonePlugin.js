function BuildDonePlugin(msg) {
  this.msg = msg;
}

BuildDonePlugin.prototype.apply = function apply(compiler) {
  compiler.hooks.done.tap('BuildDonePlugin', () => {
    console.info(this.msg);
  });
};

module.exports = BuildDonePlugin;
