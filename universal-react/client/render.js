import React from 'react';
import ReactDOM from 'react-dom';
import { AppDataContext } from '../index';
import { HelmetProvider } from 'react-helmet-async';

const initialAppData = { ...window.__OCF_APP_DATA__ };

/**
 * Client render - renders your react app to the DOM
 *
 * @param ReactComponent - The root component of your React app
 * @param domNode - DOM node that the React app should be rendered to.
 *
 * @return {undefined}
 */
export default async function renderOnClient(ReactComponent, domNode) {
  /**
   * Delete server styles once the client-side version loaded
   */
  if (__DEVELOPMENT__) {
    const clientStyles = document.querySelector('link#ocf-client-styles');
    const serverStyles = document.querySelector('style#ocf-server-styles');
    waitForLoad(clientStyles, () => {
      serverStyles && serverStyles.remove();
    });
  }

  ReactDOM.hydrate(
    <AppDataProvider ReactComponent={ReactComponent}>
      <HelmetProvider>
        <ReactComponent />
      </HelmetProvider>
    </AppDataProvider>,
    domNode
  );
}

function AppDataProvider({ ReactComponent, ...props }) {
  const ignoredFirstRouteChange = React.useRef();
  const [appData, setAppData] = React.useState(initialAppData);

  const handleRouteChange = React.useCallback(
    async location => {
      if (ignoredFirstRouteChange.current !== true) {
        ignoredFirstRouteChange.current = true;
        return;
      }

      if (typeof ReactComponent.getPageData !== 'function') return;

      setAppData({
        ...initialAppData,
        pageData: await ReactComponent.getPageData(`${location.pathname}${location.search}`),
      });
    },
    [setAppData, ReactComponent]
  );

  return <AppDataContext.Provider {...props} value={{ ...appData, onRouteChange: handleRouteChange }} />;
}

function waitForLoad(link, cb) {
  if (!link || link.sheet) {
    cb();
  } else {
    link.onload = cb;
  }
}
