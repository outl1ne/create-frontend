import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';
import { HelmetProvider } from 'react-helmet-async';

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
  const serverContext = {};
  const appData = { config };

  /**
   * Fetch async data
   */
  if (typeof ReactComponent.getPageData === 'function') {
    appData.pageData = await ReactComponent.getPageData({ req });
  }

  const helmetContext = {};
  /**
   * Render app to string
   */
  const appString = ReactDOMServer.renderToString(
    <AppDataContext.Provider value={{ ...appData, serverContext }}>
      <HelmetProvider context={helmetContext}>
        <ReactComponent />
      </HelmetProvider>
    </AppDataContext.Provider>
  );

  return {
    content: wrapInDocument(appString, appData, helmetContext),
    context: serverContext,
  };
}
