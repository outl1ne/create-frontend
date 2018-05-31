# Contributing

To develop this toolkit, you need to make a test project where you will be using
this generator. You also need to symlink this project so your test project
installs the local version, instead of from npm.

* `npm install` - install node modules
* `npm link` while in this directory - makes `create-frontend` accesible
  globally
* Go to your test project and type `create-frontend --dev`
