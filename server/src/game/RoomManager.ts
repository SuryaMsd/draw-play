import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { Room, Player, GameStatus, GameSettings } from './types.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(hostSocketId: string, nickname: string): Room {
    const code = nanoid(6).toUpperCase();
    const room: Room = {
      id: nanoid(),
      code,
      hostId: hostSocketId,
      status: 'LOBBY',
      settings: {
        maxPlayers: 4,
        roundTime: 80,
        roundsCount: 2,
      },
      players: [
        {
          id: nanoid(),
          socketId: hostSocketId,
          nickname,
          score: 0,
          isReady: false,
          isDrawer: false,
        },
      ],
      currentRound: 0,
      roundTimer: 0,
    };

    this.rooms.set(code, room);
    return room;
  }

  public joinRoom(code: string, socketId: string, nickname: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    if (room.players.length >= room.settings.maxPlayers) return null;

    const newPlayer: Player = {
      id: nanoid(),
      socketId,
      nickname,
      score: 0,
      isReady: false,
      isDrawer: false,
    };

    room.players.push(newPlayer);
    return room;
  }

  public leaveRoom(socketId: string): { roomCode: string; isEmpty: boolean } | null {
    for (const [code, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.socketId === socketId);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          this.rooms.delete(code);
          return { roomCode: code, isEmpty: true };
        }
        // Reassign host if host left
        if (room.hostId === socketId && room.players.length > 0) {
          room.hostId = room.players[0].socketId;
        }
        return { roomCode: code, isEmpty: false };
      }
    }
    return null;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  public updatePlayerReady(code: string, socketId: string, isReady: boolean): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find((p) => p.socketId === socketId);
    if (player) {
      player.isReady = isReady;
    }

    return room;
  }

  public checkAllReady(code: string): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;
    return room.players.length >= 2 && room.players.every((p) => p.isReady);
  }

  public startGame(code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.status = 'PLAYING';
    room.currentRound = 0;
    this.startRound(room);

    return room;
  }

  private startRound(room: Room) {
    room.currentRound++;
    room.status = 'PLAYING';
    
    // Rotate drawer
    room.players.forEach((p) => (p.isDrawer = false));
    const drawerIndex = (room.currentRound - 1) % room.players.length;
    room.players[drawerIndex].isDrawer = true;

    // Pick a word (randomly from player submissions - simplified for now)
    // In a real app, you'd pull from submitted words
    const words = ['Dinosaur', 'Spaceship', 'Pizza', 'Watermelon', 'Guitar', 'Robot', 'Dragon', 'Sunflower'];
    room.currentWord = words[Math.floor(Math.random() * words.length)];
    
    room.roundTimer = room.settings.roundTime;
    
    // Start timer interval
    if (room.roundInterval) clearInterval(room.roundInterval);
    room.roundInterval = setInterval(() => {
      room.roundTimer--;
      this.io.to(room.code).emit('game:timer', { timer: room.roundTimer });

      if (room.roundTimer <= 0) {
        if (room.roundInterval) clearInterval(room.roundInterval);
        this.endRound(room);
      }
    }, 1000);
  }

  private endRound(room: Room) {
    if (room.currentRound < room.settings.roundsCount * room.players.length) {
      room.status = 'PREPARING';
      this.io.to(room.code).emit('game:round-end', { word: room.currentWord });
      setTimeout(() => {
        this.startRound(room);
        this.io.to(room.code).emit('room:status', room);
      }, 5000);
    } else {
      room.status = 'ENDED';
      this.io.to(room.code).emit('game:end', { players: room.players });
    }
  }

  public submitGuess(code: string, socketId: string, guess: string): { isCorrect: boolean; room: Room } | null {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'PLAYING') return null;

    const player = room.players.find((p) => p.socketId === socketId);
    if (!player || player.isDrawer) return null;

    const isCorrect = guess.toLowerCase().trim() === room.currentWord?.toLowerCase();
    if (isCorrect) {
      // Award points based on time left
      player.score += room.roundTimer * 10;
      
      // End the round immediately so next player can draw
      if (room.roundInterval) clearInterval(room.roundInterval);
      this.endRound(room);
    }

    return { isCorrect, room };
  }
}
