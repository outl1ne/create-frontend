// SCSS entry. In production, the contents are extracted into a separate file. In dev, JS loads the CSS dynamically.
import 'app/scss/entry.scss';
import React from 'react';
import Helmet from 'react-helmet-async';

export default function App() {
  return (
    <div>
      <Helmet>
        <title>Page title</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <h1>Hello world!</h1>
    </div>
  );
}

App.getPageData = async () => ({});
