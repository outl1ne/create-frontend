import React from 'react';
import ReactDOMServer from 'react-dom/server';
import wrapInDocument from './wrapInDocument';
import { AppDataContext } from '../index';
import { HelmetProvider } from 'react-helmet-async';
import urlParser from 'url';
import crypto from 'crypto';

/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param url - The url for the request. For express, you should pass `req.originalUrl`
 * @param props - This will get passed to the App component during server render, and as the 2nd argument to getPageData
 *
 * @return {{ content: String, context: Object, nonce: String }}
 */
export default async function renderOnServer(ReactComponent, url, props = {}) {
  const serverContext = {};
  const helmetContext = {};
  const appData = { url, pageData: {} };

  /**
   * Get page data
   */
  if (ReactComponent && typeof ReactComponent.getPageData === 'function') {
    const parsedUrl = urlParser.parse(url);
    appData.pageData = (
      await ReactComponent.getPageData(
        {
          pathname: parsedUrl.pathname,
          search: parsedUrl.search,
        },
        props
      )
    )({});
  }

  if (!ReactComponent) {
    // Pass info that we skipped SSR to the browser, so we can fetch data immediately and avoid trying to hydrate
    appData.skippedSSR = true;
  }

  /**
   * Render app to string
   */
  const appString = ReactDOMServer.renderToString(
    <AppDataContext.Provider value={{ ...appData, serverContext }}>
      <HelmetProvider context={helmetContext}>{ReactComponent ? <ReactComponent {...props} /> : ' '}</HelmetProvider>
    </AppDataContext.Provider>
  );

  const nonce = crypto.randomBytes(16).toString('base64');

  return {
    content: wrapInDocument(appString, appData, helmetContext, nonce),
    context: serverContext,
    nonce
  };
}
