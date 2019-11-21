import { createServer, IncomingMessage, ServerResponse} from 'http';
import * as SSEStream from 'ssestream';

import * as logger from '@src/utils/logger';
import { SSE_SERVER_PORT } from '@src/config';

const streams = new Map<string, SSEStream[]>();

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const stream = new SSEStream(req);
  stream.pipe(res);
  
  const path: string = req.url;
  
  const arr: SSEStream[] = streams.get(path) || [];
  arr.push(stream);
  streams.set(path, arr);
  logger.sse(path, `Connected from ${req.socket.remoteAddress}`);
  
  req.socket.on('close', () => {
    const arr: SSEStream[] = streams.get(path) || [];
    arr.splice(arr.indexOf(stream), 1);
    streams.set(path, arr);
    logger.sse(path, `Disconnected from ${req.socket.remoteAddress}`);
  });
})

server.listen(SSE_SERVER_PORT, () => {
  console.log(`*** SSE Server Started at ${SSE_SERVER_PORT} !!!`);
});

export function send(path: string, data: object | string, event?: string) {
  logger.sse(path, data);
  const arr = streams.get(path) || [];
  arr.forEach(stream => stream.write({ data, event }));
}

export function close(path: string) {
  logger.sse(path, '[CLOSE]');
  const arr = streams.get(path) || [];
  arr.forEach(stream => stream.end());
}