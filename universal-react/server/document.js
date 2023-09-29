import serialize from 'serialize-javascript';

export default function document({ content, manifest, styles, helmet, appData, cspNonce }) {
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
