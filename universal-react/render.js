import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';

export default async function render(App, arg) {
  const IS_SERVER = typeof window === 'undefined';

  if (IS_SERVER) return renderOnServer(App, arg);
  return renderOnClient(App, arg);
}

async function renderOnClient(App, domNode) {
  return ReactDOM.render(<App />, domNode);
}

async function renderOnServer(App, req) {
  console.log('req', req);
  return ReactDOMServer.renderToString(<App />);
}
