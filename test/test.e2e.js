const makeDir = require('./utils/makeTempDir');
const startDevServer = require('./utils/startDevServer');
const runGenerator = require('./utils/runGenerator');
const fs = require('fs');
const fetch = require('node-fetch');

describe('Create Frontend with React template', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = await makeDir();
  });

  afterAll(() => {
    tempDir.cleanup();
  });

  it('should generate a folder structure', async () => {
    await runGenerator(tempDir.path);

    const files = fs.readdirSync(tempDir.path);

    expect(files).toEqual(
      expect.arrayContaining([
        'client', // Frontend directory was created
        'package.json', // NPM boilerplate was added
        'node_modules', // NPM modules were installed
      ])
    );
  });

  it('should start the dev server without errors', async () => {
    const { url, cleanup } = await startDevServer(tempDir.path);

    const result = await fetch(url);
    expect(result.status).toBe(200);
    const text = await result.text();
    expect(text.startsWith('<!DOCTYPE html>')).toBe(true);

    cleanup();
  });
});
