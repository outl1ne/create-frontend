# OD Frontend

This is a toolkit that generates your project's frontend build system. It uses
Webpack under the hood.

## Features

* JS with Babel, eslint, babel-polyfill
* SCSS with autoprefixer, normalize.css
* Hot reload for development
* Works with zero configuration, but customization is possible if needed

## Usage

1. Install the toolkit globally: `npm install -g @optimistdigital/od-frontend`
2. In the CLI, go into your project root, type `od-create-frontend` and follow
   the instructions

### CLI

* `npm run build` - Build assets for production
* `npm run build:debug` - Build assets with extra debug logs. In JS, `__DEBUG__`
  will be [transformed](https://webpack.js.org/plugins/define-plugin/) to `true`
* `npm run dev` - Start a webpack server for development

### Configuration

You can configure the build process with the `od-frontend` property in your
`package.json`. Possible options (default in parens):

* `publicDirectory` (_public_) - The public directory that your server will
  serve. Relative to project root.
* `buildPath` (_build_) - Build files will be generated into this path. Relative
  to the public directory.
* `entryPoints` - Object|string|array that contains the
  [entry points](https://webpack.js.org/concepts/entry-points/) for your
  application. A separate file will be built for each entry point. Relative to
  project root. Default:
  ```js
  {
      app: 'client/js/entry.js',
  }
  ```
* `hashFileNames` (_true_) - Whether or not filenames should be hashed in
  production (e.g `app-503dcc37.js`). An `asset-manifest.json` file will be
  generated either way.

### Using hot module replacement

[Hot module replacement](https://webpack.js.org/api/hot-module-replacement/) is
enabled for the app, however you must choose manually what you want to update
when changes are made. To do this, go into your `entry.js` file and uncomment
the relevant code.

## Project structure

* `/client` - your frontend source code lives here.
* `/public/build` - your production code will be built here.
* `/asset-manifest.json` - this file is generated automatically, and contains
  the paths for your app entry points. Use this to link the assets in your
  backend.
* `.eslintrc` - [Eslint](https://webpack.js.org/api/hot-module-replacement/)
  configuration.
* `.prettierrc` - [Prettier](https://prettier.io/) configuration.

## Development

To start development, type `npm run dev`. Assets will be served on a webpack
server.

# Contributing

To develop this toolkit, you need to make a test project where you will be using
this generator. You also need to symlink this project so your test project
installs the local version, instead of from npm.

* `npm install` - install node modules
* `npm link` while in this directory - makes `od-create-frontend` accesible
  globally
* Go to your test project and type `od-create-frontend --dev`

```

```
