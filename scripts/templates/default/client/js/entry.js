// SCSS entry. In production, the contents are extracted into a separate file. In dev, JS loads the CSS dynamically.
import '../scss/entry.scss';

// Polyfills
import 'core-js/stable';

console.log('Hello world!');

/**
 * Hot module replacement
 * Uncomment the code to enable HMR in your app. Documentation:
 * https://webpack.js.org/api/hot-module-replacement/
 */
/*
if (module.hot) {
  module.hot.accept('./library.js', function() {
    // Do something with the updated library module...
  });
}
*/
