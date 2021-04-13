import { render } from '@optimistdigital/create-frontend/universal-react/server';
import App from 'app/App';
import express from 'express';
import getConfig from 'server/config';
import helmet from '@optimistdigital/create-frontend/universal-react/helmet';
import compression from 'compression';

const server = express();
const staticOpts = { maxAge: 604800000 };

if (__PRODUCTION__) server.use(compression()); // Enable gzip in production
server.use(helmet(opts => ({ ...opts, contentSecurityPolicy: false })));
server.use('/client', express.static('build/client', staticOpts)); // Serve build assets
server.use('/', express.static('public', staticOpts)); // Serve files from public directory
server.use('/', async (req, res) => {
  try {
    // Render the app
    const { content, context } = await render(App, req.originalUrl, { config: getConfig() }, res.locals.cspNonce);

    // If there was a redirect in the app, redirect here
    if (context.url) {
      return res.redirect(context.status || 302, context.url);
    }

    // Send HTML response and take status from the app if given
    return res.status(context.status || 200).send(content);
  } catch (err) {
    console.error('Error while rendering React, skipping SSR:', err);

    // If SSR failed, send an empty page so client can try to render
    return res.status(500).send((await render(null, req.originalUrl, { config: getConfig() })).content);
  }
});

export default server;
