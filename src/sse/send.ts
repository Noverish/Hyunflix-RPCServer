import { createServer, IncomingMessage, ServerResponse } from 'http';
import SSEStream from 'ssestream';

import * as logger from '@src/utils/logger';
import { SSE_SERVER_PORT } from '@src/config';

const streams = new Map<IncomingMessage, SSEStream>();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const stream = new SSEStream(req);
  stream.pipe(res);

  const path: string = req.url;

  streams.set(req, stream);
  logger.sse(path, `Connected from ${req.socket.remoteAddress}`);

  req.socket.on('close', () => {
    streams.delete(req);
    logger.sse(path, `Disconnected from ${req.socket.remoteAddress}`);
  });
});

server.listen(SSE_SERVER_PORT, () => {
  console.log(`*** SSE Server Started at ${SSE_SERVER_PORT} !!!`);
});

export default function (path: string, data: object | string, event?: string) {
  Array.from(streams.entries())
    .filter(([req, stream]) => req.url === path)
    .forEach(([req, stream]) => stream.write({ data, event }));
}
