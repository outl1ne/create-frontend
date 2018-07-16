#! /usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline-sync');
const chalk = require('chalk');
const createPackageJson = require('../scripts/createPackageJson');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const args = require('minimist')(process.argv.slice(2));
const templates = require('../scripts/templates/templates');

const CURRENT_DIR = process.cwd();
const TEMPLATE_PATH = path.resolve(__dirname, '..', 'template');

const error = (err, ...rest) => console.error(chalk.red.bold(err), ...rest);
const info = (msg, ...rest) => console.info(chalk.blue(msg), ...rest);
const success = (msg, ...rest) => console.info(chalk.green(msg), ...rest);
const log = (...rest) => console.log(...rest);

function getProjectNameFromCwd() {
  return path.basename(CURRENT_DIR);
}

function getConfirmation(msg) {
  console.log('');
  return readline.question(chalk.blue(msg));
}

function findExistingFrontendFiles() {
  const needles = [path.resolve(CURRENT_DIR, 'package.json')];
  const output = needles.filter(file => fs.existsSync(file));

  fs.readdirSync(TEMPLATE_PATH).forEach(file => {
    const destinationPath = path.resolve(CURRENT_DIR, file);
    if (fs.existsSync(destinationPath)) {
      output.push(destinationPath);
    }
  });

  return output;
}

function init() {
  const template = templates[args.template] || null;
  const skipConfirmation = args.y === true;

  // Get confirmation from user
  if (
    !skipConfirmation &&
    getConfirmation(
      `Are you sure you want to generate a front-end for ${getProjectNameFromCwd()}? (y/N) `
    ).toLowerCase() !== 'y'
  ) {
    log('Aborted.');
    return;
  }

  // Check if cwd has conflicting ciles
  const existingFrontendFiles = findExistingFrontendFiles();
  if (existingFrontendFiles.length > 0) {
    if (args.overwrite === true) {
      if (
        !skipConfirmation &&
        getConfirmation(
          `The following files will be overwritten. Are you sure? (y/N)\n${existingFrontendFiles
            .map(name => `- ${name}`)
            .join('\n')}\n`
        ).toLowerCase() !== 'y'
      ) {
        log('Aborted.');
        return;
      }
    } else {
      error(
        `We have detected an existing frontend setup in your current directory. Please remove the following files and retry:`
      );
      info(existingFrontendFiles.map(name => `- ${name}`).join('\n'));
      info('');
      info(
        `If you wish to overwrite these files, run this command with the --overwrite flag.`
      );

      return;
    }
  }

  // Generate package.json
  const packageJson = createPackageJson({
    name: getProjectNameFromCwd(),
    isDev: !!args.dev,
    customDependencies: template && template.install,
  });

  // Write package.json into cwd
  fs.writeFileSync(path.resolve(CURRENT_DIR, 'package.json'), packageJson);
  // Copy contents of template folder into cwd
  fs.copySync(TEMPLATE_PATH, CURRENT_DIR);
  template.templatePath && fs.copySync(template.templatePath, CURRENT_DIR);
  // Install npm dependencies
  success('Optimist frontend boilerplate created.');
  info('Installing modules (this may take some time)...\n');
  exec(`npm install`)
    .then(res => {
      log(res.stderr);
      success('Done!');
      info('For development, type `npm run dev`.');
      info('For production, type `npm run build`.');
      info('Documentation: https://github.com/optimistdigital/create-frontend');
    })
    .catch(err => {
      error('Installing node modules failed:', err.message);
    });
}

init();
