import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { RoomManager } from './game/RoomManager.js';
import { setupDrawingHandlers } from './sockets/drawing.js';
import { setupVoiceHandlers } from './sockets/voice.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

const prisma = new PrismaClient();
const roomManager = new RoomManager(io);
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('room:create', ({ nickname }) => {
    const room = roomManager.createRoom(socket.id, nickname);
    socket.join(room.code);
    socket.emit('room:status', room);
    console.log(`Room created: ${room.code} by ${nickname}`);
  });

  socket.on('room:join', ({ code, nickname }) => {
    const room = roomManager.joinRoom(code, socket.id, nickname);
    if (room) {
      socket.join(room.code);
      io.to(room.code).emit('room:status', room);
      console.log(`${nickname} joined room: ${code}`);
    } else {
      socket.emit('error', { message: 'Room not found or full' });
    }
  });

  socket.on('room:ready', ({ code, isReady }) => {
    const room = roomManager.updatePlayerReady(code, socket.id, isReady);
    if (room) {
      io.to(room.code).emit('room:status', room);
      
      if (roomManager.checkAllReady(code)) {
        // Start game preparation
        io.to(room.code).emit('game:start-prep');
      }
    }
  });

  socket.on('room:start', ({ code }) => {
    const room = roomManager.startGame(code);
    if (room) {
      io.to(room.code).emit('room:status', room);
    }
  });

  socket.on('game:guess', ({ code, guess }) => {
    const result = roomManager.submitGuess(code, socket.id, guess);
    if (result) {
      if (result.isCorrect) {
        io.to(code).emit('game:correct-guess', { userId: socket.id, nickname: result.room.players.find(p => p.socketId === socket.id)?.nickname });
        io.to(code).emit('room:status', result.room);
      } else {
        io.to(code).emit('game:chat', { userId: socket.id, nickname: result.room.players.find(p => p.socketId === socket.id)?.nickname, message: guess });
      }
    }
  });

  setupDrawingHandlers(io, socket);
  setupVoiceHandlers(io, socket);

  socket.on('disconnect', () => {
    const result = roomManager.leaveRoom(socket.id);
    if (result) {
      const room = roomManager.getRoom(result.roomCode);
      if (room) {
        io.to(result.roomCode).emit('room:status', room);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

export { io, prisma };
