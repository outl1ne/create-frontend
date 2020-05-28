import { useAppData } from '@optimistdigital/create-frontend/universal-react';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter, withRouter, matchPath } from 'react-router';
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
  const appData = useAppData();

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

export async function getRouteData(location, routes, backendData) {
  const route = routes.find(x => matchPath(location.pathname, { exact: true, ...x }));

  let updater;
  if (route && route.component && route.component.getPageData) {
    updater = await route.component.getPageData(location, matchPath(location.pathname, route).params, backendData);
  }

  return updater || (prevState => prevState);
}
