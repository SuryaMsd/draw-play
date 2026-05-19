export type GameStatus = 'LOBBY' | 'PREPARING' | 'PLAYING' | 'ENDED';

export interface GameSettings {
  maxPlayers: number;
  roundTime: number; // in seconds
  roundsCount: number;
}

export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  score: number;
  isReady: boolean;
  isDrawer: boolean;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: GameStatus;
  settings: GameSettings;
  players: Player[];
  currentRound: number;
  currentWord?: string;
  roundTimer: number;
  roundInterval?: ReturnType<typeof setInterval>;
}
