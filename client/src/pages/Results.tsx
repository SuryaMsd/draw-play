import React from 'react';
import { motion } from 'framer-motion';
import type { Room } from '../types/game';
import { Trophy, Award, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsProps {
  room: Room;
}

export const Results: React.FC<ResultsProps> = ({ room }) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  React.useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl glass p-12 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Trophy size={80} className="text-yellow-400 mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">GAME OVER!</h1>
          <p className="text-gray-400 text-lg mb-12">Here's how everyone did</p>
        </motion.div>

        <div className="space-y-4 mb-12">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`flex items-center justify-between p-6 rounded-3xl border ${
                index === 0 
                  ? 'bg-primary/20 border-primary shadow-neon-purple scale-105' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                  index === 0 ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="text-left">
                  <span className="block text-xl font-bold text-white">{player.nickname}</span>
                  {index === 0 && <span className="text-xs text-primary font-bold uppercase tracking-widest">Grand Champion</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-mono font-black text-white">{player.score}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Total Points</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-neon-purple transition-all"
          >
            <RotateCcw size={20} />
            PLAY AGAIN
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all"
          >
            <Home size={20} />
            HOME
          </button>
        </div>
      </div>
    </motion.div>
  );
};
