// SCSS entry. In production, the contents are extracted into a separate file. In dev, JS loads the CSS dynamically.
import '../scss/entry.scss';
// Babel-polyfill adds support for newer browser features to ensure browser compatibility.
import '@babel/polyfill';
import App from '../../app/App.js';
import render from '@optimistdigital/create-frontend/universal-react/client/render';

function hydrate() {
  render(App, document.getElementById('react-app'));
}

hydrate();

/**
 * Hot module replacement
 * Uncomment the code to enable HMR in your app. Documentation:
 * https://webpack.js.org/api/hot-module-replacement/
 */
if (module.hot) {
  module.hot.accept('../../app/App.js', () => {
    hydrate();
  });
}
