#! /usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline-sync');
const chalk = require('chalk');
const getPackageJson = require('../scripts/getPackageJson');

const CURRENT_DIR = process.cwd();
const TEMPLATE_PATH = path.resolve(__dirname, '..', 'template');

const error = (err, ...rest) => console.error(chalk.red.bold(err), ...rest);
const info = (msg, ...rest) => console.info(chalk.blue(msg), ...rest);
const log = (...args) => console.log(...args);

function getProjectNameFromCwd() {
  const folders = CURRENT_DIR.split('/');
  return folders[folders.length - 1];
}

function getConfirmation() {
  return readline.question(
    `Are you sure you want to generate a front-end for ${getProjectNameFromCwd()}? (y/N) `
  );
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
  if (getConfirmation().toLowerCase() !== 'y') {
    log('Aborting.');
    return;
  }

  const existingFrontendFiles = findExistingFrontendFiles();
  if (existingFrontendFiles.length > 0) {
    error(
      `We have detected an existing frontend setup in your current directory.
Please remove the following files and retry:`
    );
    log(existingFrontendFiles.map(name => `- ${name}`).join('\n'));

    return;
  }

  const packageJson = getPackageJson({
    name: getProjectNameFromCwd(),
  });

  fs.writeFileSync(path.resolve(CURRENT_DIR, 'package.json'), packageJson);
  fs.copySync(TEMPLATE_PATH, CURRENT_DIR);
}

init();
