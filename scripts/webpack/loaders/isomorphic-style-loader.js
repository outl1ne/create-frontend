/**
 * This is a "fork" from here: https://github.com/kriasoft/isomorphic-style-loader/blob/master/src/index.js
 * They have a dependency on React which is causing us to ship two copies of React, which also breaks
 * the usage of hooks in certain cases. Until they resolve this, we will use a local clone that is more barebones.
 */

/**
 * Isomorphic CSS style loader for Webpack
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
const { stringifyRequest } = require('loader-utils');

module.exports = function loader() {};
module.exports.pitch = function pitch(request) {
  if (this.cacheable) {
    this.cacheable();
  }

  return `
    var refs = 0;
    var css = require(${stringifyRequest(this, `!!${request}`)});
    var content = typeof css === 'string' ? [[module.id, css, '']] : css;
    exports = module.exports = css.locals || {};
    exports._getContent = function() { return content; };
    exports._getCss = function() { return '' + css; };
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      module.hot.accept(${stringifyRequest(this, `!!${request}`)}, function() {
        css = require(${stringifyRequest(this, `!!${request}`)});
        content = typeof css === 'string' ? [[module.id, css, '']] : css;
      });
      module.hot.dispose(function() {});
    }
  `;
};
