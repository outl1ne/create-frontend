const makeDir = require('./utils/makeTempDir');
const startDevServer = require('./utils/startDevServer');
const runGenerator = require('./utils/runGenerator');
const fs = require('fs');
const fetch = require('node-fetch');

describe('Create Frontend with Universal React template', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = await makeDir();
  });

  afterAll(() => {
    tempDir.cleanup();
  });

  it('should generate a folder structure', async () => {
    console.info('Generating boilerplate for universal-react template...');
    await runGenerator(tempDir.path, ['--template=universal-react']);
    console.info('Boilerplate generated');

    const files = fs.readdirSync(tempDir.path);

    expect(files).toEqual(
      expect.arrayContaining([
        'client', // Frontend directory was created
        'server', // Backend directory was created
        'app', // React app directory was created
        'package.json', // NPM boilerplate was added
        'node_modules', // NPM modules were installed
      ])
    );
  });

  it('should start the dev server without errors', async () => {
    console.info('Starting dev server...');
    const { output, cleanup } = await startDevServer(tempDir.path, {
      devServerMessage: /server started at/i,
      webBuildDoneMessage: /build for web done/i,
      nodeBuildDoneMessage: /build for node done/i,
    });
    console.info('Dev server started');

    const url = output.devServerMessage.match(/https?:\/\/.*:(?:\d)+/)[0];
    const result = await fetch(url);
    expect(result.status).toBe(200);
    const text = await result.text();
    expect(text).toMatch(/^<!DOCTYPE html>/i);

    await cleanup();
  });
});
