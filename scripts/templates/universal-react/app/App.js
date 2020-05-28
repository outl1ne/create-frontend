import 'app/scss/entry.scss';
import { Helmet } from 'react-helmet-async';
import { Switch, Route } from 'react-router-dom';
import { useAppData } from '@optimistdigital/create-frontend/universal-react';
import ErrorBoundary from 'app/components/ErrorBoundary';
import ErrorPage from 'app/pages/ErrorPage';
import React from 'react';
import Router, { getRouteData } from '@optimistdigital/create-frontend/universal-react/Router';
import routes from 'app/routes';

export default function App() {
  const appData = useAppData();

  console.log('Hello world!', appData);

  return (
    <React.Fragment>
      <Helmet>
        <title>New app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <ErrorBoundary renderError={() => <ErrorPage status={500} />}>
        <Router>
          <Switch>
            {routes.map(route => (
              <Route key={route.path} exact {...route} />
            ))}
            <Route>
              <ErrorPage status={404} />
            </Route>
          </Switch>
        </Router>
      </ErrorBoundary>
    </React.Fragment>
  );
}

/**
 * This function gets called once in the server, and in the client whenever the page changes.
 * The result ends up in the AppData.
 */
App.getPageData = async (location, props) => {
  // Finds the current route component and gets data from that
  const routeDataSetter = await getRouteData(location, routes, props);

  return prevState => ({
    // Merge in the data from the route components
    ...routeDataSetter(prevState),
    // You can set data here that will be added on every page
    config: prevState.config || props.config,
  });
};
