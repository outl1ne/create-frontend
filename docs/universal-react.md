# Universal React App

This template will set up a React project that renders on both the client and server with Node.js.

**Additional CLI scripts:**

-   `npm run start` - Starts the production server

**Additional configuration options:**

-   `serverEntryPoint` (_server/entry.js_) - Entry point for your server.
-   `serverBuildPath` (_server/build_) - Where the compiled server will be built. Relative to project root.

## Rendering

`create-frontend` exposes render functions that take care of rendering the React app on the server and client:

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
 * @return {string}
 */
import { render } from '@optimistdigital/create-frontend/universal-react/server';
const string = render(ReactComponent, request, config);
```

## Configuration

The `server/config.js` file contains your app configuration. You can define values here that will be accessed throughout your app.
The configuration is available in React components (both server and client) through the **AppDataContext**:

```js
import { AppDataContext } from '@optimistdigital/create-frontend/universal-react';

// With hooks API
function Header() {
    const { config } = React.useContext(AppDataContext);
    return <div>{config.APP_NAME}</div>;
}

// With consumer API
function Header() {
    return (
        <AppDataContext.Consumer>
            {({ config }) => {
                return <div>{config.APP_NAME}</div>;
            }}
        </AppDataContext.Consumer>
    );
}
```

## Server-side data fetching

You can add a static function called getPageData to your App component that returns a promise.
The result of this promise will be available on the client and server through AppDataContext.

```js
export default class App extends React.Component {
    /**
     * @param context
     * @param context.req - The request object from the server
     */
    static async getPageData({ req }) {
        // Make async network requests here
        return {
            url: req.url,
        };
    }
}
```
