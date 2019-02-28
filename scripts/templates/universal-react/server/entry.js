import express from 'express';
import App from '../app/App';
import render from '@optimistdigital/create-frontend/universal-react/server/render';

const server = express();

server.use('/', async (req, res) => {
  try {
    return res.status(200).send(await render(App, req));
  } catch (err) {
    console.error('Server encountered error while rendering React app:', err);
    return res.status(500).send('Internal server error');
  }
});

const APP_PORT = process.env.APP_PORT || 3000;
server.listen(APP_PORT, () => {
  console.info(`✅  Server started at http://localhost:${APP_PORT}`);
});
