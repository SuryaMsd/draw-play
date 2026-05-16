import { Socket, Server } from 'socket.io';

export const setupDrawingHandlers = (io: Server, socket: Socket) => {
  socket.on('draw:start', (data: { code: string; x: number; y: number; color: string; size: number }) => {
    socket.to(data.code).emit('draw:start', { ...data, userId: socket.id });
  });

  socket.on('draw:move', (data: { code: string; x: number; y: number }) => {
    socket.to(data.code).emit('draw:move', { ...data, userId: socket.id });
  });

  socket.on('draw:end', (data: { code: string }) => {
    socket.to(data.code).emit('draw:end', { userId: socket.id });
  });

  socket.on('draw:clear', (data: { code: string }) => {
    socket.to(data.code).emit('draw:clear');
  });

  socket.on('draw:undo', (data: { code: string }) => {
    socket.to(data.code).emit('draw:undo');
  });
};
