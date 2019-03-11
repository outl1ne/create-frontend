#! /usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline-sync');
const chalk = require('chalk');
const createPackageJson = require('../scripts/createPackageJson');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const args = require('minimist')(process.argv.slice(2));
const getTemplate = require('../scripts/templates/templates');

const CURRENT_DIR = process.cwd();

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

function findExistingFrontendFiles(templatePaths) {
  const needles = [path.resolve(CURRENT_DIR, 'package.json')];
  const paths = needles.filter(file => fs.existsSync(file));

  templatePaths.forEach(templatePath => {
    fs.readdirSync(templatePath).forEach(file => {
      const destinationPath = path.resolve(CURRENT_DIR, file);
      if (fs.existsSync(destinationPath)) {
        paths.push(destinationPath);
      }
    });
  });

  // Remove duplicates
  const output = Array.from(new Set(paths));

  return output;
}

function init() {
  const isDev = !!args.dev;
  const templateName = args.template || 'default';
  const templateOpts = {
    name: getProjectNameFromCwd(),
    isDev,
  };
  const template = getTemplate(templateName, templateOpts);

  if (template == null) {
    error(`The template "${templateName}" does not exist.`);
    return;
  }

  const skipConfirmation = args.y === true;

  // Get confirmation from user
  if (
    !skipConfirmation &&
    getConfirmation(
      `Are you sure you want to generate a front-end for ${getProjectNameFromCwd()}${
        template ? ` with template ${args.template}` : ''
      }? (y/N) `
    ).toLowerCase() !== 'y'
  ) {
    log('Aborted.');
    return;
  }

  // Get array of template paths
  const templatePaths = [template.templatePath];
  if (template.mergeDefaultFiles === true) templatePaths.unshift(getTemplate('default', templateOpts).templatePath);

  // Check if cwd has conflicting ciles
  const existingFrontendFiles = findExistingFrontendFiles(templatePaths);
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
      info('');
      error(
        `We have detected an existing frontend setup in your current directory. Please remove the following files and retry:`
      );
      info(existingFrontendFiles.map(name => `- ${name}`).join('\n'));
      info('');
      info(`If you wish to overwrite these files, run this command with the --overwrite flag.`);

      return;
    }
  }

  // Generate package.json
  const packageJson = createPackageJson(template);

  // Write package.json into cwd
  fs.writeFileSync(path.resolve(CURRENT_DIR, 'package.json'), packageJson);

  // Copy templates into cwd
  templatePaths.forEach(templatePath => {
    fs.copySync(templatePath, CURRENT_DIR);
  });

  info('');
  success('Optimist frontend boilerplate created.');
  info('');

  // Install npm dependencies
  info('Installing modules (this may take some time)...\n');
  exec(`npm install`)
    .then(res => {
      log(res.stderr);
      success('Done!');
      (
        template.postGenerationMessages || [
          'For development, type `npm run dev`.',
          'For production, type `npm run build`.',
          'Documentation: https://github.com/optimistdigital/create-frontend',
        ]
      ).forEach(msg => {
        info(msg);
      });
    })
    .catch(err => {
      error('Installing node modules failed:', err.message);
    });
}

init();
