import { Helmet } from 'react-helmet';
import fs from 'fs';

/* Read manifest using fs, because require() would try to resolve at build-time  */
const manifest = JSON.parse(fs.readFileSync(__OCF_MANIFEST_PATH__, 'utf8'));

export default function wrapInDocument(content) {
  /* Get dev-only styles, to prevent FOUC. This is a virtual file injected by the dev server. */
  const styles = __DEVELOPMENT__ ? require('ocf-style-injection-hack.js') : [];

  /* Get page meta data from react-helmet */
  const helmet = Helmet.renderStatic();

  return `<!doctype html>
<html ${helmet.htmlAttributes.toString()}>
  <head>
    <meta charset="UTF-8">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${manifest['app.css'] ? `<link rel="stylesheet" href="${manifest['app.css']}">` : ''}
    ${styles && `<style id="ocf-server-styles">${styles}</style>`}
  </head>
  <body ${helmet.bodyAttributes.toString()}>
    <div id="react-app">${content}</div>
    <script src="${manifest['app.js']}"></script>
  </body>
</html>`;
}
