import React from 'react';
import ReactDOM from 'react-dom';
import { AppDataContext } from '../index';

/**
 * Client render - renders your react app to the DOM
 *
 * @param reactComponent - The root component of your React app
 * @param domNode - DOM node that the React app should be rendered to.
 *
 * @return {undefined}
 */
export default async function renderOnClient(App, domNode) {
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
    <AppDataContext.Provider value={window.__OCF_APP_DATA__}>
      <App />
    </AppDataContext.Provider>,
    domNode
  );
}

function waitForLoad(link, cb) {
  if (!link || link.sheet) {
    cb();
  } else {
    link.onload = cb;
  }
}
