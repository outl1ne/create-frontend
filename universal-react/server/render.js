import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param backendData - Data that you'd like to be accessible in the app (on both the client and server) through AppDataContext.
 *
 * @return {{ content: String, context: Object }}
 */
export default async function renderOnServer(ReactComponent, url, backendData = {}) {
  const serverContext = {};
  const helmetContext = {};
  const appData = { url, ...backendData, pageData: {} };

  /**
   * Get page data
   */
  if (typeof ReactComponent.getPageData === 'function') {
    appData.pageData = (await ReactComponent.getPageData(url))(appData.pageData);
  }

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
