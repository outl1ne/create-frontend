# Create Frontend

This toolkit generates your project's frontend build system. It uses Webpack
under the hood.

## Features

* JS (Babel, Eslint, Babel-Polyfill, Flow, JSX). Can import relative to project
  root: `import x from 'client/js/y'`
* SCSS with autoprefixer, normalize.css
* Hot reload for development
* Works with zero configuration, but customization is possible if needed

## Usage

1. Install the toolkit globally: `npm install -g
   @optimistdigital/create-frontend`
2. Type `create-frontend` in your project root and follow the instructions

### CLI

* `npm run dev` - Start a webpack server for development
* `npm run build` - Build assets for production
* `npm run build:debug` - Build assets with debug logs. In JS, `__DEBUG__` will
  be [transformed](https://webpack.js.org/plugins/define-plugin/) to `true`

There are also flags to customize the dev environment:

* `npm run dev -- --webpackPort=8000` - Custom port for dev server
* `npm run dev -- --webpackDomain=localhost` - Custom domain for dev server
* `npm run dev -- --protocol=https` - Run the dev server with https

### Configuration

Configuration goes in the your package.json under the `create-frontend` field
(default in parens):

* `publicDirectory` (_public_) - Project's public root. Relative to project
  root.
* `buildPath` (_build_) - Where the build files will go. Relative to the public
  directory.
* `entryPoints` - Object/string/array that contains the
  [entry points](https://webpack.js.org/concepts/entry-points/) for your
  application. Relative to project root. Default:
  ```js
  {
      app: 'client/js/entry.js',
  }
  ```
* `hashFileNames` (_true_) - Whether or not filenames should be hashed in
  production (e.g `app-503dcc37.js`). An `asset-manifest.json` file will be
  generated either way.

### Adding custom webpack rules / plugins

To configure the webpack rules and plugins, you can create a
`create-frontend.conf.js` file to the project root and export an object like
this:

```js
module.exports = {
  getPlugins: opts => [],
  getRules: opts => [],
};
```

* `getPlugins` - Function that returns an array of plugins. Appended to the end
  of the plugins array.
* `getRules` - Function that returns an array of rules. The first one to match
  will be used
  ([oneOf](https://webpack.js.org/configuration/module/#rule-oneof)). This may
  override default rules.

The `opts` parameter contains an `IS_DEVELOPMENT` boolean.

### Using hot module replacement

[Hot module replacement](https://webpack.js.org/api/hot-module-replacement/) is
enabled for the app, however you must choose manually what you want to update
when changes are made. To do this, go into your `entry.js` file and uncomment
the relevant code.

# Contributing

To develop this toolkit, you need to make a test project where you will be using
this generator. You also need to symlink this project so your test project
installs the local version, instead of from npm.

* `npm install` - install node modules
* `npm link` while in this directory - makes `create-frontend` accesible
  globally
* Go to your test project and type `create-frontend --dev`
