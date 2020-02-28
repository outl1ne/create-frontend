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

  const content = (
    <AppDataProvider ReactComponent={ReactComponent} appProps={props}>
      <HelmetProvider>
        <ReactComponent {...props} />
      </HelmetProvider>
    </AppDataProvider>
  );

  if (window.__OCF_APP_DATA__.skippedSSR === true) {
    ReactDOM.render(content, domNode);
  } else {
    ReactDOM.hydrate(content, domNode);
  }
}

function AppDataProvider({ ReactComponent, appProps, ...rest }) {
  const ignoredFirstRouteChange = React.useRef();
  const [appData, setAppData] = React.useState(initialAppData);

  const setPageData = React.useCallback(
    async location => {
      if (typeof ReactComponent.getPageData !== 'function') return;

      const updater = await ReactComponent.getPageData(location, appProps);

      setAppData(prevState => ({
        ...prevState,
        pageData: updater(prevState.pageData),
      }));
    },
    [ReactComponent, appProps]
  );

  const handleRouteChange = React.useCallback(
    location => {
      if (ignoredFirstRouteChange.current !== true) {
        ignoredFirstRouteChange.current = true;
        return;
      }

      setPageData({
        pathname: location.pathname,
        search: location.search,
      });
    },
    [setPageData]
  );

  /**
   * Fetch page data immediately, if SSR was skipped
   */
  React.useEffect(() => {
    if (initialAppData.skippedSSR) {
      setPageData({
        pathname: location.pathname,
        search: location.search,
      });
    }
  }, [setPageData]);

  return <AppDataContext.Provider {...rest} value={{ ...appData, onRouteChange: handleRouteChange }} />;
}

function waitForLoad(link, cb) {
  if (!link || link.sheet) {
    cb();
  } else {
    link.onload = cb;
  }
}
