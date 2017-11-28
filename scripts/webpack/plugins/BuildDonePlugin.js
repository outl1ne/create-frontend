function BuildDonePlugin(msg) {
  this.msg = msg;
}

BuildDonePlugin.prototype.apply = function apply(compiler) {
  compiler.plugin('done', () => {
    console.info(this.msg);
  });
};

module.exports = BuildDonePlugin;
