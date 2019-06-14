const makeDir = require('./utils/makeTempDir');
const startServer = require('./utils/startServer');
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
    await runGenerator(tempDir.path, ['--template=universal-react']);

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
    const { output, cleanup } = await startServer(tempDir.path, 'dev', {
      devServerMessage: /server started at/i,
      webBuildDoneMessage: /build for web done/i,
      nodeBuildDoneMessage: /build for node done/i,
    });

    const url = output.devServerMessage.match(/https?:\/\/.*:(?:\d)+/)[0];
    const result = await fetch(url);
    expect(result.status).toBe(200);

    const text = await result.text();
    expect(text).toMatch(/^<!DOCTYPE html>/i);

    await cleanup();
  });
});
