# Universal React App

This template will set up a React project that renders on both the client and server with Node.js.

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

Create-Frontend exposes render functions that take care of rendering the React app on the server and client:

```js
/**
 * Client render - renders your react app to the DOM
 *
 * @param ReactComponent - The root component of your React app
 * @param domNode - DOM node that the React app should be rendered to.
 *
 * @return {undefined}
 */
import { render } from '@optimistdigital/create-frontend/universal-react/client';
render(ReactComponent, domNode);
```

```js
/**
 * Server render - renders your react app to string
 *
 * @param ReactComponent - The root component of your React app
 * @param request - The request object from the server
 * @param config - App configuration that will be exposed to the React app
 *
 * @return {{ content: String, context: Object }}
 */
import { render } from '@optimistdigital/create-frontend/universal-react/server';
const {
    content, // App rendered to string
    context, // Server-side context, for passing data to from the React app to the server
} = render(ReactComponent, request, config);
```

## Configuration

The `server/config.js` file contains your app configuration. You can define values here that will be accessed throughout your app.
The configuration is available in React components (both server and client) through the **AppDataContext**:

```js
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';

function Header() {
    const { config } = React.useContext(AppDataContext);
    return <div>{config.APP_NAME}</div>;
}
```

Note that this example uses the hooks API, but other [context API's](https://reactjs.org/docs/context.html#api) work as well.

## Server-side data fetching

Your top level App component can have a static function called `getPageData` that returns a promise.
The result of this promise will be available on the client and server through AppDataContext.

```js
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import React from 'react';

export default function App() {
    const { pageData } = React.useContext(AppDataContext);
    return <div>{pageData.url}</div>;
}

App.getPageData = async ({ req }) => ({
    url: req.url,
});
```

PS! This only works on the top level component that you pass to render, not any children.

## React-Router

We have a wrapper around [React-Router](https://github.com/ReactTraining/react-router) that handles the
client/server differences, and passes information about status codes and redirects to the server.
To use it, wrap your application around the Router and pass the current URL:

```js
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';
import Router from '@optimistdigital/create-frontend/universal-react/Router';

export default function App() {
    const { pageData } = React.useContext(AppDataContext);
    return <Router url={pageData.url}>Your app content goes here</Router>;
}

App.getPageData = async ({ req }) => ({
    url: req.url,
});
```

## Passing data from React app to server (such as http status code)

If you're using a router, you probably want to let the server know when a 404 page was rendered to set the correct status code. This can be done by mutating the `serverContext` property found in the AppDataContext:

```js
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';

export default function NotFoundPage() {
    const appData = React.useContext(AppDataContext);
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
