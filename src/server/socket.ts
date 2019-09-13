import * as socketio from 'socket.io';

import { SOCKET_PATH } from '@src/config';
import { server } from '@src/server';

const sockets = {};

const io = socketio(server, { path: SOCKET_PATH });
io.on('connection', (socket) => {
  console.log(`[${new Date().toLocaleString()}]`, '[Socket] Connected!', socket.id);
  sockets[socket.id] = socket;
  
  socket.on('disconnect', () => {
    console.log(`[${new Date().toLocaleString()}]`, '[Socket] Disonnected!', socket.id);
    delete sockets[socket.id];
  });
});

export function send(encodeId: number, progress: number, remain: number, speed: number) {
  const payload = { encodeId, progress, remain, speed };
  
  const socketIds = Object.keys(sockets);
  for(const socketId of socketIds) {
    const socket = sockets[socketId];
    socket.send(JSON.stringify(payload));
  }
}