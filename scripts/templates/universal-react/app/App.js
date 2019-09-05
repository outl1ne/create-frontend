import 'app/scss/entry.scss';
import { Switch, Route } from 'react-router-dom';
import AppDataContext from '@optimistdigital/create-frontend/universal-react/AppDataContext';
import Helmet from 'react-helmet-async';
import React from 'react';
import Router, { getRouteData } from '@optimistdigital/create-frontend/universal-react/Router';
import routes from 'app/routes';

export default function App() {
  const { config } = React.useContext(AppDataContext);

  return (
    <React.Fragment>
      <Helmet>
        <title>{config.APP_NAME}</title>
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

/**
 * This function gets called once in the server, and in the client whenever the page changes.
 * The result ends up in the AppDataContext.
 */
App.getPageData = async location => {
  // Finds the current route component and gets data from that
  const routeDataSetter = await getRouteData(location, routes);

  return prevState => ({
    // Merge in the data from the route components
    ...routeDataSetter({
      ...prevState,
      // You can set data here that will be added on every page
    }),
  });
};
