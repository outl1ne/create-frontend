import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router';
import React from 'react';

export default function Router({ children, url, ...passthrough }) {
  return (
    <AppDataContext.Consumer>
      {appData => {
        /**
         * Client-side render
         */
        if (__TARGET__ === 'web') {
          return <BrowserRouter {...passthrough}>{children}</BrowserRouter>;
        }

        /**
         * Server-side render
         */
        return (
          <StaticRouter {...passthrough} location={url} context={appData.serverContext}>
            {children}
          </StaticRouter>
        );
      }}
    </AppDataContext.Consumer>
  );
}
