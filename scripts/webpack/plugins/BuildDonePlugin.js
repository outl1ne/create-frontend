function BuildDonePlugin(cb) {
  this.cb = cb;
}

function getFirstWarningOrError(compilation, type) {
  if (compilation.children && compilation.children.length) {
    for (let i = 0; i < compilation.children.length; i++) {
      const warningsOrErrors = compilation.children[i][type];
      /* istanbul ignore else */
      if (warningsOrErrors && warningsOrErrors[0]) {
        return warningsOrErrors[0];
      }
    }
  }
  return compilation[type][0];
}

BuildDonePlugin.prototype.apply = function apply(compiler) {
  compiler.hooks.done.tap('BuildDonePlugin', stats => {
    if (stats.hasErrors()) {
      console.error(`# Error during build`, getFirstWarningOrError(stats.compilation, 'errors'));
    } else if (stats.hasWarnings()) {
      console.warn(`# Warning during build`, getFirstWarningOrError(stats.compilation, 'warnings'));
    } else {
      this.cb();
    }
  });
};

module.exports = BuildDonePlugin;
