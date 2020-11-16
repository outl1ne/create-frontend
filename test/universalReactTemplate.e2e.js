const makeDir = require('./utils/makeTempDir');
const startServer = require('./utils/startServer');
const runGenerator = require('./utils/runGenerator');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const execa = require('execa');

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

  it('should create a production build with a manifest', async () => {
    const subprocess = execa('npm', ['run', 'build'], { cwd: tempDir.path });

    subprocess.stderr.on('data', chunk => {
      const data = chunk.toString();

      console.error('Error during build:', data);
    });

    await subprocess;

    /**
     * Checking client build
     */
    const clientFiles = fs.readdirSync(path.resolve(tempDir.path, 'build/client'));

    expect(clientFiles).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^app-.*\.css/),
        expect.stringMatching(/^app-.*\.js/),
        'asset-manifest.json',
      ])
    );

    const manifest = JSON.parse(fs.readFileSync(path.resolve(tempDir.path, 'build/client/asset-manifest.json')));

    expect(manifest).toMatchObject({
      'app.css': expect.stringMatching(/^\/client\/.*\.css/),
      'app.js': expect.stringMatching(/^\/client\/.*\.js/),
    });

    /**
     * Checking server build
     */
    const serverFiles = fs.readdirSync(path.resolve(tempDir.path, 'build/server'));

    expect(serverFiles).toEqual(expect.arrayContaining(['build-server.js']));
  });
});
