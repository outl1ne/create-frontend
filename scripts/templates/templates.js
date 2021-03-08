/* eslint-disable object-shorthand */
const path = require('path');

function getCurrentVersion() {
  const appPackage = require(path.resolve(__dirname, '../../', 'package.json'));
  return `^${appPackage.version}`;
}

module.exports = function getTemplate(templateName, { isDev, name }) {
  // default is reserved :(
  const defaultTemplate = {
    name: 'default',
    install: {},
    templatePath: path.resolve(__dirname, 'default'),
    gitIgnore: ['/public/build', '/node_modules', '.DS_Store', '.vscode', '.idea'],
    readme: projectName => `
# ${projectName}

This app uses [create-frontend](https://github.com/optimistdigital/create-frontend/blob/master/readme.md).

## Development

- \`npm ci\` - install dependencies
- \`npm run dev\` - start local development server

## Production

- \`npm ci\` - install dependencies
- \`npm run build\` - build the app
- \`npm run serve\` - start the node server
    `,
    // prettier-ignore
    packageJson: {
      'name': name,
      'version': '0.1.0',
      'private': true,
      'create-frontend': {},
      'browserslist': ['> 0.2%', 'last 1 version', 'not dead'],
      'scripts': {
        'dev': 'frontend-scripts dev',
        'build': 'frontend-scripts build',
        'build:debug': 'frontend-scripts build --debug',
      },
      'eslintConfig': {
          'extends': './node_modules/@optimistdigital/create-frontend/eslint-config.js'
      },
      'prettier': {
        'printWidth': 120,
        'singleQuote': true,
        'trailingComma': 'es5'
      },
      'dependencies': {
        'core-js': '^3.6.4',
        '@babel/runtime-corejs3': '^7.9.2',
        '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '../../') : getCurrentVersion(),
        'normalize.css': '8.x.x',
      },
    }
  };

  const react = {
    name: 'react',
    install: {
      react: '^17.0.1',
      'react-dom': '^17.0.1',
    },
    mergeDefaultFiles: true,
    templatePath: path.resolve(__dirname, 'react'),
    gitIgnore: defaultTemplate.gitIgnore,
    readme: defaultTemplate.readme,
    packageJson: defaultTemplate.packageJson,
  };

  const universalReact = {
    name: 'universal-react',
    install: {
      react: '^17.0.1',
      'react-dom': '^17.0.1',
    },
    mergeDefaultFiles: false,
    templatePath: path.resolve(__dirname, 'universal-react'),
    gitIgnore: ['/build', '/node_modules', '.DS_Store', '.vscode', '.idea'],
    // prettier-ignore
    packageJson: {
      'name': name,
      'version': '0.1.0',
      'private': true,
      'create-frontend': {
        "publicDirectory": "build",
        "buildPath": "client",
        "entryPoints": {
          "app": "client/entry.js",
        }
      },
      'browserslist': ['> 0.2%', 'last 1 version', 'not dead'],
      'scripts': {
        'dev': 'frontend-scripts dev-universal-react',
        'build': 'frontend-scripts build-universal-react',
        'build:debug': 'frontend-scripts build-universal-react --debug',
        'start': 'frontend-scripts start-universal-react'
      },
      'eslintConfig': defaultTemplate.packageJson.eslintConfig,
      'prettier': defaultTemplate.packageJson.prettier,
      'dependencies': {
        'core-js': '^3.6.4',
        '@babel/runtime-corejs3': '^7.9.2',
        '@optimistdigital/create-frontend': isDev ? path.resolve(__dirname, '../../') : getCurrentVersion(),
        'detect-port': '^1.3.0',
        'express': '^4.17.1',
        'normalize.css': '8.x.x',
        'react-helmet-async': '^1.0.4',
        'react-router': '^5.2.0',
        'react-router-dom': '^5.2.0'
      },
    },
    readme: projectName => `
# ${projectName}

This is a server-rendered React app that uses [create-frontend](https://github.com/optimistdigital/create-frontend/blob/master/docs/universal-react.md).

## Development

- \`npm ci\` - install dependencies
- \`npm run dev\` - start local development server

## Production

- \`npm ci\` - install dependencies
- \`npm run build\` - build the app
- \`npm run serve\` - start the node server
    `,
    postGenerationMessages: [
      'For development, type `npm run dev`.',
      'For production, type `npm run build` to build and `npm run start` to serve.',
      'Documentation: https://github.com/optimistdigital/create-frontend/blob/master/docs/universal-react.md',
    ],
  };

  const templates = {
    default: defaultTemplate,
    react,
    'universal-react': universalReact,
  };

    // NPM hoists transitive dependencies to the top level when installing a package through the NPM registry.
  // This is necessary for eslint to find the correct plugins (which are installed in this package).
  // Eslint is unable to find plugins from this package - it needs them to be in the consumer package.
  // However, when installing this package locally (for testing, in dev mode), transitive dependencies are not hoisted.
  // This means that the build won't work when installed locally (through the filesystem).
  // So we must add these dependencies explicitly.
  if (isDev) {
    const ownPackage = require('../../package.json');
    const eslintPackages = ['eslint', 'eslint-plugin-import', 'eslint-plugin-jsx-a11y', 'eslint-plugin-react', 'eslint-plugin-react-hooks'];

    Object.values(templates).forEach(template => {
      eslintPackages.forEach(packageName => {
        template.packageJson.dependencies[packageName] = ownPackage.dependencies[packageName];
      })
    });
  }

  return templates[templateName];
};
