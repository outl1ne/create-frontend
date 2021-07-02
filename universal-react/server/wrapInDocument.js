import fs from 'fs';
import serialize from 'serialize-javascript';

let _manifest;
function getManifest() {
  // If manifest has already been read, reuse it, so we don't need to keep making fs calls in production
  if (_manifest) return _manifest;

  // Reads manifest using fs, because require() would try to resolve at build-time
  const manifestString = fs.readFileSync(__OCF_MANIFEST_PATH__, 'utf8');

  try {
    _manifest = JSON.parse(manifestString);
  } catch (err) {
    console.error(err);
    throw new Error(
      `Failed to parse manifest. ${
        __DEVELOPMENT__
          ? 'It may still be rebuilding. Try again in a second, or restart the dev server.'
          : `Ensure that the build correctly created a JSON file at ${__OCF_MANIFEST_PATH__}.`
      }`
    );
  }

  return _manifest;
}

export default function wrapInDocument(content, appData, helmetContext, cspNonce, inlineStyles = []) {
  /* Get dev-only styles, to prevent FOUC. This is a virtual file injected by the dev server. */
  const styles = __DEVELOPMENT__ ? require('ocf-dev-styles.js') : [];

  /* Get page meta data from react-helmet */
  const { helmet } = helmetContext;

  const manifest = getManifest();

  return `<!doctype html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
    <meta charset="UTF-8">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${manifest['app.css'] ? `<link rel="stylesheet" href="${manifest['app.css']}">` : ''}
    ${__DEVELOPMENT__ && styles ? `<style id="ocf-server-styles">${styles.join('\n')}</style>` : ''}
    ${helmet.script.toString()}
    ${helmet.noscript.toString()}
    ${helmet.style.toString()}
    ${inlineStyles.join('')}
  </head>
  <body ${helmet.bodyAttributes.toString()}>
    <div id="react-app">${content}</div>
    <script${cspNonce ? ` nonce="${cspNonce}" ` : ''}>Object.defineProperty(window, '__OCF_APP_DATA__', {
      value: ${serialize(appData)}
    });</script>
    <script ${__DEVELOPMENT__ ? 'crossorigin ' : ''}src="${manifest['app.js']}"></script>
  </body>
</html>`;
}
