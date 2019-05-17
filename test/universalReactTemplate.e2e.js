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
    console.log('Generating boilerplate for universal-react template...');
    await runGenerator(tempDir.path, ['--template=universal-react']);
    console.log('Boilerplate generated');

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
    console.log('Starting dev server...');
    const { output, cleanup } = await startDevServer(tempDir.path, {
      devServerMessage: /server started at/i,
      webBuildDoneMessage: /build for web done/i,
      nodeBuildDoneMessage: /build for node done/i,
    });
    console.log('Dev server started');

    const url = output.devServerMessage.match(/https?:\/\/.*:(?:\d)+/)[0];
    console.log('Navigating to URL', url);
    const result = await fetch(url);
    console.log('Navigated to URL');
    expect(result.status).toBe(200);
    console.log('Waiting for text content');
    const text = await result.text();
    console.log('Text content arrived');
    expect(text).toMatch(/^<!DOCTYPE html>/i);

    await cleanup();
  });
});
