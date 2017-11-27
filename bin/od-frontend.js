#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

switch (script) {
  case 'dev':
    require('../scripts/dev')(nodeArgs);
    return;
  case 'build':
    require('../scripts/build')(nodeArgs);
    return;
  default:
    console.error(`Script not found: ${script}`);
    break;
}
