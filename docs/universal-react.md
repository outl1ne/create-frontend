# Universal React App

This template will set up a React project that renders in both the client and server with Node.js.

## Usage

1. In Bash, navigate into your project directory
2. Type `npx @optimistdigital/create-frontend --template=universal-react` to install the toolkit
3. Type `npm run dev` to start developing

The configuration and commands are the same as with the default template, but there are some additional options:

**Additional CLI scripts:**

-   `npm run start` - Starts the production server

**Additional configuration options:**

-   `serverEntryPoint` (_server/entry.js_) - Entry point for your server.
-   `serverBuildPath` (_build/server_) - Where the compiled server will be built. Relative to project root.

## Rendering

Create-Frontend exposes functions that take care of rendering the React app in the server and client:

```js
/**
 * Client render - renders your react app to the DOM
 *
 * @param ReactComponent - The root component of your React app
 * @param domNode - DOM node that the React app should be rendered to.
 * @param props (optional) - This will get passed to the App component during render, and as the 2nd argument to getPageData.
 *              You will have to ensure that passing different props on server/client won't result in a different HTML,
 *              Otherwise you will get content mismatch errors during hydration.
 */
import { render } from '@optimistdigital/create-frontend/universal-react/client';
render(ReactComponent, domNode, props);
```

```js
/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param url - The url for the request. For express, you should pass `req.originalUrl`
 * @param props (optional) - This will get passed to the App component during render, and as the 2nd argument to getPageData.
 *              You will have to ensure that passing different props on server/client won't result in a different HTML,
 *              Otherwise you will get content mismatch errors during hydration.
 * @param cspNonce (optional) - Sets the `nonce` attribute on the <script> element that create-frontend uses.
 *                 Used for the script-src directive when implementing a content-security-policy.
 *
 * @return {{ content: String, context: Object }}
 */
import { render } from '@optimistdigital/create-frontend/universal-react/server';
const {
    content, // App rendered to string
    context, // Server-side context, for passing data to from the React app to the server
} = render(ReactComponent, url, backendData, res.locals.cspNonce);
```

## Configuration

The `server/config.js` file contains your app configuration. You can define values here that will be accessed throughout your app.
The configuration is available in React components (both server and client) with the **AppData** hook:

```js
import { useAppData } from '@optimistdigital/create-frontend/universal-react';

function Header() {
    const { config } = useAppData();
    return <div>{config.APP_NAME}</div>;
}
```

Note that this example uses the hooks API, but other [context API's](https://reactjs.org/docs/context.html#api) work as well.

## Page based data fetching

The top level App component can have an async function called `getPageData`, which is called once in the server, and in the client whenever the page changes.

This function gets the page's location as an argument, and returns an updater function. The updater function gets the previous state and should return the new state.

The page data will be available in the AppData hook.

```js
import { useAppData } from '@optimistdigital/create-frontend/universal-react';
import React from 'react';

export default function App() {
    const { pageData } = useAppData();
    return <div>{pageData.url}</div>;
}

App.getPageData = async location => {
    // Fetch some data asynchronously here
    return prevState => ({
        ...prevState,
        url: location.pathname,
    });
};
```

With the default boilerplate, this can also be used on route components. In this case the function also receives the URL params as a second argument:

```js
HomePage.getPageData = async (location, params) => {
    // Fetch some data for the homepage here
    return prevState => ({
        ...prevState,
        homePageData: {},
    });
};
```

## React-Router

We have a wrapper around [React-Router](https://github.com/ReactTraining/react-router) that handles the
client/server differences, and passes information about status codes and redirects to the server.
To use it, wrap your application around the Router.

```js
import Router from '@optimistdigital/create-frontend/universal-react/Router';

export default function App() {
    return <Router>Your app content goes here</Router>;
}
```

## Passing data from React app to server (such as http status code)

If you're using a router, you probably want to let the server know when a 404 page was rendered to set the correct status code. This can be done by mutating the `serverContext` property found in the AppData hook:

```js
import { useAppData } from '@optimistdigital/create-frontend/universal-react';

export default function NotFoundPage() {
    const appData = useAppData();
    if (appData.serverContext) appData.serverContext.status = 404;

    return <div>Page not found!</div>;
}
```

This content is then available in the `context` property after the server render:

```js
import { render } from '@optimistdigital/create-frontend/universal-react/server';

// Render the app
const { content, context } = render(ReactComponent, request, config);

// Read status from server context, with 200 as the default
return res.status(context.status || 200).send(content);
```

PS! The `serverContext` property is only available during the server render, so make sure you check for that.
