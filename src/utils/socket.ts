import * as socketio from 'socket.io';

import { server } from '@src/app';
import { logger } from '@src/utils';

const sockets = {};

export function createSocket(path: string) {
  const io = socketio(server, { path });
  sockets[path] = [];
  
  io.on('connection', (socket) => {
    logger(`[Socket] Connected ${socket.id} at "${path}"`);
    sockets[path].push(socket);
    
    socket.on('disconnect', () => {
      logger(`[Socket] Disconnected ${socket.id} at "${path}"`);
      sockets[path] = sockets[path].filter(s => s !== socket);
    });
  });
}

export function send(path: string, payload: object) {
  const socketList: socketio.Socket[] = sockets[path];
  
  for (const socket of socketList) {
    socket.send(JSON.stringify(payload));
  }
}
