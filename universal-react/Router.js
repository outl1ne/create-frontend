import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router';
import React from 'react';

export default function Router({ children, url }) {
  return (
    <AppDataContext.Consumer>
      {appData => {
        /**
         * Client-side render
         */
        if (__TARGET__ === 'web') {
          return <BrowserRouter>{children}</BrowserRouter>;
        }

        /**
         * Server-side render
         */
        return (
          <StaticRouter location={url} context={appData.serverContext}>
            {children}
          </StaticRouter>
        );
      }}
    </AppDataContext.Consumer>
  );
}
