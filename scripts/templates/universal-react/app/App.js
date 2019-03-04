// SCSS entry. In production, the contents are extracted into a separate file. In dev, JS loads the CSS dynamically.
import 'app/scss/entry.scss';
import React from 'react';
import { Helmet } from 'react-helmet';

export type Props = {};

export default class App extends React.Component {
  props: Props;

  render() {
    return (
      <div>
        <div>Hello world!</div>

        <Helmet>
          <title>Page title</title>
        </Helmet>
      </div>
    );
  }
}
