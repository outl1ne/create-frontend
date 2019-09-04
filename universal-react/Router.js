import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter, withRouter } from 'react-router';
import React from 'react';

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const RouteChangeListener = withRouter(({ children, location, onChange }) => {
  const prevLocation = usePrevious(location);

  React.useEffect(() => {
    if (
      !prevLocation ||
      `${location.pathname}${location.search}` !== `${prevLocation.pathname}${prevLocation.search}`
    ) {
      onChange && onChange(location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, onChange]);
  return children;
});

export default function Router({ children, ...passthrough }) {
  const appData = React.useContext(AppDataContext);

  if (__TARGET__ === 'web') {
    return (
      <BrowserRouter {...passthrough}>
        <RouteChangeListener children={children} onChange={appData.onRouteChange} />
      </BrowserRouter>
    );
  }

  /**
   * Server-side render
   */
  return (
    <StaticRouter {...passthrough} location={appData.url} context={appData.serverContext}>
      {children}
    </StaticRouter>
  );
}
