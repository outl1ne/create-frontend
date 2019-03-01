# Universal React App

This template will set up a React project that renders on both the client and server with Node.js.
It comes with React-Router by default.

There is an additional CLI scripts:

-   `npm run start` - Starts the production server

There are also flags that you can pass to the scripts:

-   `npm run start -- --appPort=3030` - Custom port for the production server

There are some additional configuration options:

-   `serverEntryPoint` (_server/entry.js_) - Entry point for your server.
-   `serverBuildPath` (_server/build_) - Where the compiled server will be built. Relative to project root.
