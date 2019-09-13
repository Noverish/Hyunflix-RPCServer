import * as http from 'http';

import { PORT } from '@src/config';
import pause from './pause';
import resume from './resume';
import state from './state';

// From https://bigcodenerd.org/enable-cors-node-js-without-express/
const headers = {
  'Access-Control-Allow-Headers': 'authorization',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  'Access-Control-Max-Age': 2592000, // 30 days
  /** add other headers as per requirement */
};

export const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  (async function() {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/pause' && req.method === 'POST') {
      await pause(req, res);
    } else if (req.url === '/resume' && req.method === 'POST') {
      await resume(req, res);
    } else if (req.url === '/state' && req.method === 'GET') {
      await state(req, res);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  })().catch(err => {
    res.statusCode = 500;
    res.end(err.toString());
  });
})

server.listen(PORT, () => {
  console.log(`* FFMpeg Server Stareted! at ${PORT}`);
});