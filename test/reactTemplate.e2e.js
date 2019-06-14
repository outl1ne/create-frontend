const makeDir = require('./utils/makeTempDir');
const startDevServer = require('./utils/startDevServer');
const runGenerator = require('./utils/runGenerator');
const fs = require('fs');
const fetch = require('node-fetch');
const execa = require('execa');
const path = require('path');

describe('Create Frontend with React template', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = await makeDir();
  });

  afterAll(() => {
    tempDir.cleanup();
  });

  it('should generate a folder structure', async () => {
    await runGenerator(tempDir.path, ['--template=react']);

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
    const { output, cleanup } = await startDevServer(tempDir.path, {
      devServerMessage: /webpack dev server started at/i,
      buildDoneMessage: /build for web done/i,
    });

    const url = output.devServerMessage.match(/https?:\/\/.*:(?:\d)+/)[0];

    const result = await fetch(url);
    expect(result.status).toBe(200);
    const text = await result.text();
    expect(text).toMatch(/^<!DOCTYPE html>/i);

    await cleanup();
  });

  it('should create a production build with a manifest', async () => {
    await execa('npm', ['run', 'build'], { cwd: tempDir.path });

    const files = fs.readdirSync(path.resolve(tempDir.path, 'public/build'));

    expect(files).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^app-.*\.css/),
        expect.stringMatching(/^app-.*\.js/),
        'asset-manifest.json',
      ])
    );

    const manifest = JSON.parse(fs.readFileSync(path.resolve(tempDir.path, 'public/build/asset-manifest.json')));

    expect(manifest).toMatchObject({
      'app.css': expect.stringMatching(/^\/build\/.*\.css/),
      'app.js': expect.stringMatching(/^\/build\/.*\.js/),
    });
  });
});
