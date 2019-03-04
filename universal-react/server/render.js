import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';

/**
 * Server render - renders your react app to string
 *
 * @param reactComponent - The root component of your React app
 * @param request - The request object from the server
 * @param config - App's configuration that will be exposed to the React app
 *
 * @return {string}
 */
export default async function renderOnServer(App, req, config) {
  const appData = { config };
  return wrapInDocument(
    ReactDOMServer.renderToString(
      <AppDataContext.Provider value={appData}>
        <App />
      </AppDataContext.Provider>
    ),
    appData
  );
}
