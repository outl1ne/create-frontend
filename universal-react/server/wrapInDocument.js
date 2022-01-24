import fs from 'fs';
import defaultDocument from './document';

let _manifest;
function getManifest() {
  // If manifest has already been read, reuse it, so we don't need to keep making fs calls in production
  if (_manifest) return _manifest;

  // Reads manifest using fs, because require() would try to resolve at build-time
  const manifestString = fs.readFileSync(__OCF_MANIFEST_PATH__, 'utf8');

  try {
    _manifest = JSON.parse(manifestString);
  } catch (err) {
    console.error(err);
    throw new Error(
      `Failed to parse manifest. ${
        __DEVELOPMENT__
          ? 'It may still be rebuilding. Try again in a second, or restart the dev server.'
          : `Ensure that the build correctly created a JSON file at ${__OCF_MANIFEST_PATH__}.`
      }`
    );
  }

  return _manifest;
}

export default function wrapInDocument(
  content,
  appData,
  helmetContext,
  cspNonce,
  inlineStyles = [],
  document = defaultDocument
) {
  /* Get dev-only styles, to prevent FOUC. This is a virtual file injected by the dev server. */
  const styles = __DEVELOPMENT__ ? require('ocf-dev-styles.js') : [];

  /* Get page meta data from react-helmet */
  const { helmet } = helmetContext;

  const manifest = getManifest();

  return document({ content, manifest, styles, helmet, appData, cspNonce, inlineStyles });
}
