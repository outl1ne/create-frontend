import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';

export default async function renderOnServer(App) {
  return wrapInDocument(ReactDOMServer.renderToString(<App />));
}
