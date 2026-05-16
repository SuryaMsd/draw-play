import { Socket, Server } from 'socket.io';

export const setupVoiceHandlers = (io: Server, socket: Socket) => {
  socket.on('voice:signal', (data: { code: string; target: string; signal: any }) => {
    // target is the socketId of the player to send the signal to
    io.to(data.target).emit('voice:signal', {
      sender: socket.id,
      signal: data.signal,
    });
  });

  socket.on('voice:toggle-mute', (data: { code: string; isMuted: boolean }) => {
    io.to(data.code).emit('voice:mute-status', {
      userId: socket.id,
      isMuted: data.isMuted,
    });
  });
};
