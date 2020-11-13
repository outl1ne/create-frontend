# Changelog

## [14.1.0] - 2020-11-16

### Added

- `eslint-plugin-jsx-a11y` For accessibility warnings.

## [14.0.0] - 2020-05-28

### Added

-   In the universal-react template, environment variables from `.env` are now automatically updated when that file is changed.
-   Added `useAppData` hook so users don't have to use the context directly when reading app data.

### Breaking

Simplified universal-react template's entry files. Previously, we had two different files for the server (entry.js and server.js) which was confusing. `entry.js` also contained code that was irrelevant to the application and so it has been moved to create-frontend.

-   The old `server/entry.js` has been removed, and `server/server.js` has been renamed to `server/entry.js`.
-   The port detection, hot reloading and createServer code now lives in create-frontend

### Upgrading

If you have an existing project with universal-react:

1. Delete `server/entry.js`. If you wrote some custom code here, it should be moved to `server/server.js`
2. Rename `server/server.js` to `server/entry.js`

## [13.5.0] - 2020-04-01

-   All templates now generate `.gitignore` and `README.md` files. They will not be generated if they already exist in the directory
-   The default template now includes an `index.html` file
-   Updated dependencies

## [13.4.0] - 2020-01-28

-   Added error handling to the universal-react template: if no routes are matched, a 404 page will be shown. If there are errors while rendering the React app, server rendering is skipped and on the client, an error boundary is used to display an error page.
-   The `render` function in the universal-react template now accepts `null` as the first argument, to skip server rendering.

## [13.3.0] - 2020-01-23

-   Updated dependencies. We're now using babel 7.8, which gives [the nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator).

## [13.2.0] - 2019-12-30

-   [Optional chaining](https://github.com/tc39/proposal-optional-chaining) is stage 4! Added @babel/plugin-proposal-optional-chaining

## [13.1.2] - 2019-12-03

-   Fixed issue in babel configuration that resulted in multiple copies of core-js being shipped.
-   Dependency updates

## [13.1.1] - 2019-11-07

-   The default template no longer uses an ESLint config that relies on the React plugin. This fixes a warning in the console that says you are using the React plugin but don't have React installed. If updating from an existing project, you may change `eslint-config.js` to `eslint-config-vanilla.js` in your `.eslintrc` file.
-   The flowtype ESLint plugin has been removed. If you want to continue linting Flow in your project, you can add the plugin manually in your `.eslintrc` file.

## [13.1.0] - 2019-10-31

-   The universal-react template now also generates a `.gitignore` file.
-   Updates to dependencies

## [13.0.0] - 2019-09-12

**Breaking**: `getPageData` and `render` function signatures changed. The previous solution didn't give enough flexibility to integrate smoothly with data management libraries like Redux/Mobx.

-   The `render` functions (on both client and server) now accept `props` as the third argument instead of `backendData`. This will be passed as a prop to your top level React component (App.js), and also passed to `App.getPageData` as the 2nd argument. These props don't get automatically added to `appDataContext` - if you want to add them, put them in the return value of `getPageData` explicitly.

### Upgrading

-   If you were reading `backendData` contents in your React app through the `appDataContext`, you now have to pass that explicitly in `getPageData`:

```js
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
```

## [12.0.0] - 2019-09-05

-   Changes to universal-react template, mainly to add better universal data fetching capabilities:

    -   `getPageData` will now get called on client-side route changes as well.
    -   `getPageData` should now return an updater function, instead of a plain object
    -   Added boilerplate to the template to handle fetching data for specific routes. Each route's component can now have a `getPageData` function (more info in docs)
    -   Router no longer needs `url` passed to it in App.js
    -   Changed the arguments passed to `render()` on the server. The second argument is now the `url` (previously request object). The third argument is now a generic data object that will be passed on to the application (previously config)

### Upgrading

-   If you were using App.getPageData, it should be refactored something like this:

```js
// Old:
App.getPageData = async ({ req }) => ({
    foo: 'bar',
});

// New (note that this will now run on every page change):
App.getPageData = async (location, params) => prevState => ({
    foo: 'bar',
});
```

-   In the server, `render()` should be called with different arguments:

```js
// Old:
const { content, context } = await render(App, req, getConfig());

// New:
const { content, context } = await render(App, req.originalUrl, { config: getConfig() });
```

## [11.1.0] - 2019-08-02

-   Router component from universal router now passes the props through to react-router

## [11.0.0] - 2019-06-27

-   Made Babel configurable: `babel.config.js` and `.babelrc` files are now respected, and a babel config has been exposed as public API so it can be extended. If existing projects had either of these two files, you should ensure that they extend `@optimistdigital/create-frontend/babel-config`, otherwise they might break.
-   Added eslint plugin for hooks
-   Changed React template's App component to use a function component instead of a class.

## [10.0.0] - 2019-06-04

-   Removed `browserslist` from create-frontend config. Instead, it's now in the package.json as a separate field, so it can be detected by automatically by tools. If you're upgrading and had this configured previously, you can move the browserslist value to your package.json as a top level field [as documented here](https://github.com/browserslist/browserslist#queries)

## [9.1.0] - 2019-05-09

-   Added [flexbugs-fixes](https://github.com/luisrudge/postcss-flexbugs-fixes) postcss plugin, which fixes some flex bugs, mainly in IE11

## [9.0.0] - 2019-04-12

-   Removed babel-plugin-inline-react-svg - this caused problems with absolute imports, and was possibly too opinionated to begin with.
    It's trivial to add this plugin per-project if necessary.
-   getBabelOpts is now synchronous so it can be integrated with jest
-   Removed Emotion.js. This will probably not be used as extensively, and adds unnecessary complexity to the project. To continue using emotion, you will have to add the `@emotion/babel-preset-css-prop` preset, and `babel-plugin-emotion` plugin.

## [8.1.0] - 2019-03-27

-   Added Docker files for Universal-React template
-   Cleaned up initialization logs
-   Added node-notifier when there are build errors in development
-   Updated template to use core-js directly, instead of @babel/polyfill
-   Fixed issue in universal-react template, where certain styles files weren't server-rendering properly in dev mode
-   Fixed @babel/preset-env warning that asked for a core-js version to be declared. To apply this fix, you need to replace @babel/polyfill with core-js:
    -   `npm install core-js@3 @babel/runtime-corejs3 && npm uninstall @babel/polyfill`
    -   Replace `import '@babel/polyfill;` with `import 'core-js/stable';`

## [8.0.1] - 2019-03-14

-   Fixed issue where universal-react template was missing .gitignore

## [8.0.0] - 2019-03-12

-   Adds [Universal React template](docs/universal-react.md).
-   Adds opt-in [Emotion.js](https://github.com/emotion-js/emotion) support
-   Adds [babel-plugin-inline-react-svg](https://github.com/airbnb/babel-plugin-inline-react-svg) by default
-   A free webpack port now gets picked automatically, if the default one is taken by another process
-   Many minor changes in implementation details - there shouldn't be any breaking changes, but undocumented functionality might change

## [7.0.0] - 2019-02-18

-   Updated dependencies and internal configuration. No external breaking changes.

## [6.1.0] - 2018-11-23

-   Added `browserslist` config option

## [6.0.0] - 2018-11-19

-   Updated babel to 7.0.0
-   Removed `copyPath` - this plugin isn't necessary, because files can be placed in the public directory manually. Other use cases should be rare enough that this plugin can be added on a case-by-case basis.
-   Consolidated `create-frontend.conf.js` and the package.json `create-frontend` property to affect a single, global, config. This makes the configuration process less confusing and allows the entire config to be in one place, written in JS instead of JSON.

## [5.1.2] - 2018-08-13

### Fixed

-   Fixed resolve-url-loader error in Windows (issue #4)

## [5.1.1] - 2018-08-06

### Fixed

-   Fixed error during create-frontend command if no template is specified

## [5.1.0] - 2018-07-16

### Added two CLI flags for create-frontend command:

-   `--template=react` will add a React-specific boilerplate
-   `-y` flag will skip user confirmation

## [5.0.0] - 2018-06-01

### Replaced

-   The `create-frontend.conf.js` configuration file has been updated:
    -   Replaced `mergeConfig` with `editConfig = (config, options) => newConfig`.
        This can be used as an escape hatch to add/remove rules/plugins, etc, by providing you with full access to the webpack configuration object.
        The `mergeConfig` property is no longer supported, because it was a more limited version of the same functionality.
    -   Replaced `mergeDevServerConfig` with `editDevServerConfig` for the same reason.

### Added

-   `postcss-import` plugin to the postcss config. This gets rid of the deprecation warning about importing css files from scss. `entry.scss` template has been updated to show the proper way to import css files from node_modules.

### Changed

-   Autoprefixer browser support has been bumped up slightly.

### Upgrading

-   Code that you had in `mergeConfig` can be replaced with the following:

```
module.exports = {
    editConfig: config => {
        ...config,
        ...modifications
    },
    editDevServerConfig: config => {
        ...config,
        ...modifications,
    }
}
```

-   If you're importing any css files from scss, make sure they end with .css, and don't have node_modules at the beginning:

```
- @import 'node_modules/normalize.css/normalize';
+ @import 'normalize.css/normalize.css';
```

## [4.0.0] - 2018-04-09: Webpack 4

### Added

-   Updated to webpack 4. There are no breaking changes if you didn't use a `create-frontend.conf.js` file to modify the webpack config directly.

    If you did, then some things changed: notably, there is no longer an extract-text-plugin, instead, we are using mini-css-extract-plugin. Custom plugins also need to be updated to use the new webpack 4 API.

## [3.1.0] - 2018-03-22

### Added

-   Added `mergeDevServerConfig` property to the create-frontend.conf.js configuration file. This can be used to customize the webpack dev server.

## [3.0.1] - 2018-03-21

### Fixed

-   Fixed issue where static files were not being served properly in the dev server: https://github.com/optimistdigital/create-frontend/pull/1

## [3.0.0] - 2018-01-05

### Fixed

-   Fixed html plugin not maintaining nested directory structure when building for production

### Changed

-   Copy plugin now has to be opted into manually (`copyPath` in options). This fixes an error that occured when the user didn't have a `client/copy` directory. This error is now acceptable because the user opted in manually and has to be notified about broken configuration.
-   `appendRules` has been renamed to `prependRules`. "Append" was misleading, because the webpack rules are actually added to the beginning of the `oneOf` array, and will take precendence over the default rules.

### Upgrading

-   If you used create-frontend.conf.js file with `appendRules`, change it to `prependRules` (logic is same)
-   If you used the default copy path, add `"copyPath": "client/copy"` to your create-frontend configuration in package.json
-   If you relied on nested .html files being flattened into the public directory, they must now be flat in the source as well

## [2.4.0] - 2017-01-31

### Added

-   Files from `client/copy` are now automatically copied into the public directory. Path is customizable in settings

## [2.3.0] - 2018-01-31

### Added

-   Added more data to the `opts` object that is passed to the mergeConfig/appendRules/appendPlugins callbacks.
    It now additionally contains `paths` and `config` objects

## [2.2.2] - 2018-01-09

### Added

-   Added globals into eslint config, which are injected into the app by webpack : `__DEVELOPMENT__`, `__PRODUCTION__`, `__DEBUG__`

## [2.2.1] - 2018-01-08

### Fixed

-   Fixed React transforms that were throwing errors during development due to missing dependencies

## [2.2.0] - 2018-01-05

### Added

-   html-loader for html-webpack-plugin. This resolves the issue where `<img src="../images/filename.ext">` wasn't properly
    copying the assets over. PS! Absolute URL's here still don't work.

## [2.1.0] - 2018-01-04

### Added

-   html-webpack-plugin is now built-in. Customizable through options (more info in readme)

## [2.0.0] - 2018-01-02

### Added

-   Added .vue and .jsx to resolve.extensions by default. They can now be imported in js without adding the extension

### Changed

-   Refactored `create-frontend.conf.js` API. getPlugins and getRules have been replaced with the following (more info in readme):
    -   `mergeConfig` - allows user to override any configuration
    -   `appendRules` and `appendPlugins` - same as old getPlugins/getRules. Allows user to add new functionality without replacing the entire rules/plugins array
