import React from 'react';
import ReactDOM from 'react-dom';

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

  return ReactDOM.hydrate(<App />, domNode);
}

function waitForLoad(link, cb) {
  if (!link || link.sheet) {
    cb();
  } else {
    link.onload = cb;
  }
}
