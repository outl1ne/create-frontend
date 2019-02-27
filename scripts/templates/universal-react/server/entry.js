import express from 'express';
import App from '../app/App';
import { render } from '@optimistdigital/create-frontend/universal-react';

const server = express();

server.use('/', async (req, res) => {
  try {
    return res.status(200).send(await render(App, req));
  } catch (err) {
    console.err('Server encountered error while rendering React app:', err);
    return res.status(500).send('Internal server error');
  }
});
