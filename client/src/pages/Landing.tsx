import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Palette, Play, Users, Award } from 'lucide-react';

interface LandingProps {
  nickname: string;
  setNickname: (name: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ nickname, setNickname }) => {
  const { socket } = useSocket();
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = () => {
    if (!nickname) return alert('Enter a nickname');
    socket?.emit('room:create', { nickname });
  };

  const handleJoin = () => {
    if (!nickname || !roomCode) return alert('Enter nickname and room code');
    socket?.emit('room:join', { code: roomCode.toUpperCase(), nickname });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="text-center mb-12">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="inline-block"
        >
          <Palette size={80} className="text-primary mb-4" />
        </motion.div>
        <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          DOODLE PLAY
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Modern real-time drawing & guessing</p>
      </div>

      <div className="glass p-8 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">YOUR NICKNAME</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="CoolPainter99"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-white placeholder-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleCreate}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-neon-purple transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" />
            CREATE ROOM
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-gray-500">Or join one</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="ROOM CODE"
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-white placeholder-gray-600"
            />
            <button
              onClick={handleJoin}
              className="bg-secondary hover:bg-secondary-dark text-white font-bold px-6 rounded-xl shadow-neon-pink transition-all flex items-center gap-2"
            >
              <Users size={20} />
              JOIN
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-4 text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
        >
          New here? Check how to play
        </button>
      </div>

      {/* How it Works Section */}
      <div id="how-it-works" className="mt-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        <div className="flex flex-col items-center text-center p-6 glass rounded-3xl">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">1. Gather Friends</h3>
          <p className="text-gray-500 text-sm">Create a private room and share the unique 6-digit code with up to 4 friends.</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 glass rounded-3xl">
          <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary mb-4">
            <Palette size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">2. Draw & Guess</h3>
          <p className="text-gray-500 text-sm">Take turns drawing secret words on the shared canvas while others guess in real-time chat.</p>
        </div>

        <div className="flex flex-col items-center text-center p-6 glass rounded-3xl">
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mb-4">
            <Award size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">3. Earn Points</h3>
          <p className="text-gray-500 text-sm">The faster you guess, the more points you earn! Climb the leaderboard and claim victory.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-8 text-gray-500 pb-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-sm">248 Players Online</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>v1.0.0 Prod</span>
        </div>
      </div>
    </motion.div>
  );
};
