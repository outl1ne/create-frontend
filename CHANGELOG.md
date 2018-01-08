# Changelog

## [2.2.1] - 2018-01-08
### Fixed
- Fixed React transforms that were throwing errors during development due to missing dependencies

## [2.2.0] - 2018-01-05
### Added
- html-loader for html-webpack-plugin. This resolves the issue where <img src="../images/filename.ext"> wasn't properly
copying the assets over. PS! Absolute URL's here still don't work. 

## [2.1.0] - 2018-01-04
### Added
- html-webpack-plugin is now built-in. Customizable through options (more info in readme)

## [2.0.0] - 2018-01-02
### Added
- Added .vue and .jsx to resolve.extensions by default. They can now be imported in js without adding the extension

### Changed
- Refactored `create-frontend.conf.js` API. getPlugins and getRules have been replaced with the following (more info in readme):
    - `mergeConfig` - allows user to override any configuration
    - `appendRules` and `appendPlugins` - same as old getPlugins/getRules. Allows user to add new functionality without replacing the entire rules/plugins array
