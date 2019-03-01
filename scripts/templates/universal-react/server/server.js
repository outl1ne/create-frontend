import express from 'express';
import App from '../app/App';
import { render } from '@optimistdigital/create-frontend/universal-react/server';
import staticMiddleware from './middleware/staticMiddleware';

const server = express();

server.use(staticMiddleware);
server.disable('etag');

server.use('/', async (req, res) => {
  try {
    return res.status(200).send(await render(App, req));
  } catch (err) {
    console.error('Server encountered error while rendering React app:', err);
    return res.status(500).send('Internal server error');
  }
});

export default server;
