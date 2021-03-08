const fs = require('fs');
const path = require('path');

const serverEntryTemplate = fs.readFileSync(path.resolve(__dirname, './serverEntryTemplate.js'), 'utf8');

/**
 * We want the server entry point to be in our control, so we can set up things like hot reloading without polluting
 * the userland code. However, we also want the user's server entry point to be configurable, and there didn't seem
 * to be a good way to set that up conventionally. This creates the source for a virtual module, that contains the
 * server code, but also fills in the {{ USER_ENTRY_POINT }} placeholder with the entry point that the user chose.
 */
module.exports = userEntryPoint => serverEntryTemplate.replace(/{{ USER_ENTRY_POINT }}/g, userEntryPoint);
