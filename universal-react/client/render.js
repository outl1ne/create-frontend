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
 * @param props - This will get passed to the App component during client render, and as the 2nd argument to getPageData
 */
export default async function renderOnClient(ReactComponent, domNode, props = {}) {
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
    <AppDataProvider ReactComponent={ReactComponent} appProps={props}>
      <HelmetProvider>
        <ReactComponent {...props} />
      </HelmetProvider>
    </AppDataProvider>,
    domNode
  );
}

function AppDataProvider({ ReactComponent, appProps, ...rest }) {
  const ignoredFirstRouteChange = React.useRef();
  const [appData, setAppData] = React.useState(initialAppData);

  const handleRouteChange = React.useCallback(
    async location => {
      if (ignoredFirstRouteChange.current !== true) {
        ignoredFirstRouteChange.current = true;
        return;
      }

      if (typeof ReactComponent.getPageData !== 'function') return;

      const updater = await ReactComponent.getPageData(
        {
          pathname: location.pathname,
          search: location.search,
        },
        appProps
      );

      setAppData(prevState => ({
        ...prevState,
        pageData: updater(prevState.pageData),
      }));
    },
    [ReactComponent, appProps]
  );

  return <AppDataContext.Provider {...rest} value={{ ...appData, onRouteChange: handleRouteChange }} />;
}

function waitForLoad(link, cb) {
  if (!link || link.sheet) {
    cb();
  } else {
    link.onload = cb;
  }
}
