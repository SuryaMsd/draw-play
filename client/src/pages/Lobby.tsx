import React from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import type { Room } from '../types/game';
import { Check, Copy, LogOut, User } from 'lucide-react';

interface LobbyProps {
  room: Room;
  nickname: string;
}

export const Lobby: React.FC<LobbyProps> = ({ room, nickname }) => {
  const { socket } = useSocket();

  const handleReady = () => {
    const currentPlayer = room.players.find(p => p.socketId === socket?.id);
    socket?.emit('room:ready', { code: room.code, isReady: !currentPlayer?.isReady });
  };

  const handleStart = () => {
    socket?.emit('room:start', { code: room.code });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    alert('Room code copied!');
  };

  const isHost = room.hostId === socket?.id;
  const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side - Players List */}
        <div className="md:col-span-2 glass p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User size={200} />
          </div>
          
          <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">WAITING ROOM</h2>
              <p className="text-gray-400">Invite your friends to start drawing</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Players</span>
              <span className="text-3xl font-mono font-bold text-primary">{room.players.length}/4</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {room.players.map((player) => (
              <motion.div
                key={player.id}
                layoutId={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  player.isReady 
                    ? 'bg-accent/10 border-accent/50 shadow-neon-accent' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    player.socketId === room.hostId ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {player.nickname[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-white block">
                      {player.nickname} {player.socketId === socket?.id && '(YOU)'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {player.socketId === room.hostId ? 'HOST' : 'PLAYER'}
                    </span>
                  </div>
                </div>
                {player.isReady && (
                  <div className="bg-accent text-white p-1 rounded-full">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
              </motion.div>
            ))}
            
            {[...Array(4 - room.players.length)].map((_, i) => (
              <div key={i} className="border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center py-6 text-gray-700 italic text-sm">
                Waiting for player...
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Info & Actions */}
        <div className="flex flex-col gap-6">
          <div className="glass p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-2">ROOM CODE</span>
            <div 
              onClick={copyCode}
              className="group flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 cursor-pointer hover:border-primary transition-all active:scale-95"
            >
              <span className="text-4xl font-mono font-black text-white tracking-widest">{room.code}</span>
              <Copy size={20} className="text-gray-500 group-hover:text-primary" />
            </div>
          </div>

          <div className="glass p-8 rounded-3xl shadow-2xl flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rounds</span>
                <span className="text-white font-medium">{room.settings.roundsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Draw Time</span>
                <span className="text-white font-medium">{room.settings.roundTime}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Difficulty</span>
                <span className="text-accent font-medium uppercase">Mixed</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleReady}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  room.players.find(p => p.socketId === socket?.id)?.isReady
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-accent hover:bg-accent-dark text-white shadow-neon-accent'
                }`}
              >
                {room.players.find(p => p.socketId === socket?.id)?.isReady ? 'UNREADY' : 'READY TO PLAY'}
              </button>

              {isHost && (
                <button
                  disabled={!allReady}
                  onClick={handleStart}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    allReady
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-neon-purple'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  START GAME
                </button>
              )}
              
              <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors py-2">
                <LogOut size={16} />
                LEAVE ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
