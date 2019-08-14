import { render } from '@optimistdigital/create-frontend/universal-react/server';
import App from 'app/App';
import express from 'express';
import getConfig from 'server/config';

const server = express();
const staticOpts = { maxAge: 604800000 };

server.use('/client', express.static('build/client', staticOpts)); // Serve build assets
server.use('/', express.static('public', staticOpts)); // Serve files from public directory
server.use('/', async (req, res) => {
  try {
    const { content, context } = await render(App, req, getConfig());

    if (context.url) return res.redirect(context.status || 302, context.url);
    return res.status(context.status || 200).send(content);
  } catch (err) {
    console.error('Server encountered error while rendering React app:', err);
    return res.status(500).send('Internal server error');
  }
});

export default server;
