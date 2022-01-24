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
 * @param cspNonce - (optional) Sets the `nonce` attribute on the <script> element that create-frontend uses. Use it when implementing a content-security-policy.
 *
 * @return {{ content: String, context: Object }}
 */
export default async function renderOnServer(ReactComponent, url, props = {}, { cspNonce, appDecorator, document }) {
  const serverContext = {};
  const helmetContext = {};
  const appData = { url, pageData: {}, config: props.config };
  ReactComponent = __SSR_DISABLED__ ? null : ReactComponent;

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

  const ReactApp = (
    <AppDataContext.Provider value={{ ...appData, serverContext }}>
      <HelmetProvider context={helmetContext}>{ReactComponent ? <ReactComponent {...props} /> : ' '}</HelmetProvider>
    </AppDataContext.Provider>
  );

  /**
   * Render app to string
   */
  const appString = ReactDOMServer.renderToString(appDecorator ? appDecorator(ReactApp) : ReactApp);
  const jsxStyles = __USE_STYLED_JSX__ ? require('styled-jsx/server').flushToHTML({ nonce: cspNonce }) : null;

  return {
    content: wrapInDocument(appString, appData, helmetContext, cspNonce, [jsxStyles], document),
    context: serverContext,
  };
}
