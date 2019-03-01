import React from 'react';
import ReactDOM from 'react-dom';

export default async function renderOnClient(App, domNode) {
  return ReactDOM.hydrate(<App />, domNode);
}
