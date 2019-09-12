import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';
import { HelmetProvider } from 'react-helmet-async';
import urlParser from 'url';

/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param url - The url for the request. For express, you should pass `req.originalUrl`
 * @param props - This will get passed to the App component during server render, and as the 2nd argument to getPageData
 *
 * @return {{ content: String, context: Object }}
 */
export default async function renderOnServer(ReactComponent, url, props = {}) {
  const serverContext = {};
  const helmetContext = {};
  const appData = { url, pageData: {} };

  /**
   * Get page data
   */
  if (typeof ReactComponent.getPageData === 'function') {
    const parsedUrl = urlParser.parse(url);
    appData.pageData = (await ReactComponent.getPageData(
      {
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
      },
      props
    ))(appData.pageData);
  }

  /**
   * Render app to string
   */
  const appString = ReactDOMServer.renderToString(
    <AppDataContext.Provider value={{ ...appData, serverContext }}>
      <HelmetProvider context={helmetContext}>
        <ReactComponent {...props} />
      </HelmetProvider>
    </AppDataContext.Provider>
  );

  return {
    content: wrapInDocument(appString, appData, helmetContext),
    context: serverContext,
  };
}
