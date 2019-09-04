import 'app/scss/entry.scss';
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import { Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet-async';
import React from 'react';
import Router from '@optimistdigital/create-frontend/universal-react/Router';
import routes from 'app/routes';

export default function App() {
  const { pageData } = React.useContext(AppDataContext);

  return (
    <React.Fragment>
      <Helmet>
        <title>Page title</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <Router>
        <Switch>
          {routes.map(route => (
            <Route key={route.path} exact {...route} />
          ))}
        </Switch>
      </Router>
    </React.Fragment>
  );
}

App.getPageData = async url => {
  return { url };
};
