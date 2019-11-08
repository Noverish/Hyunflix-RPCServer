import * as http from 'http';
import * as SSE from 'sse';

import * as logger from '@src/utils/logger';

const clients = new Map<string, SSE.Client>();

const server: http.Server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});

server.listen(8124);

export function createServer(path: string) {
  const sse = new SSE(server, { path });
  sse.on('connection', (client: SSE.Client) => {
    close(path);
    clients.set(path, client);
    
    client.on('close', () => {
      clients.delete(path);
    })
  });
}

export function send(path: string, payload: object) {
  logger.sse(path, payload);
  const client = clients.get(path);
  if (client) {
    client.send(JSON.stringify(payload))
  }
}

export function close(path: string) {
  const client = clients.get(path);
  if (client) {
    client.close();
  }
}