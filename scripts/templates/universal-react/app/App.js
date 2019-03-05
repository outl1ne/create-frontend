// SCSS entry. In production, the contents are extracted into a separate file. In dev, JS loads the CSS dynamically.
import 'app/scss/entry.scss';
import React from 'react';
import { Helmet } from 'react-helmet';

export default function App() {
  return (
    <div>
      <Helmet>
        <title>Page title</title>
      </Helmet>

      <h1>Hello world!</h1>
    </div>
  );
}

App.getPageData = async () => ({});
