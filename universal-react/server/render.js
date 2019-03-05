import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';

/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param request - The request object from the server
 * @param config - App configuration that will be exposed to the React app
 *
 * @return {string}
 */
export default async function renderOnServer(ReactComponent, req, config) {
  const appData = { config };

  if (typeof ReactComponent.getPageData === 'function') {
    appData.asyncData = await ReactComponent.getPageData({ req });
  }

  return wrapInDocument(
    ReactDOMServer.renderToString(
      <AppDataContext.Provider value={appData}>
        <ReactComponent />
      </AppDataContext.Provider>
    ),
    appData
  );
}
