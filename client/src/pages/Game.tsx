import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import type { Room } from '../types/game';
import { Canvas } from '../components/game/Canvas';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { 
  Mic, MicOff, Send, Timer, Palette, 
  Square, Circle, Eraser, Trash2, Undo2,
  Crown, MessageSquare, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameProps {
  room: Room;
  nickname: string;
}

interface Message {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  isCorrect?: boolean;
}

export const Game: React.FC<GameProps> = ({ room, nickname }) => {
  const { socket } = useSocket();
  const [brushColor, setBrushColor] = useState('#8B5CF6');
  const [brushSize, setBrushSize] = useState(5);
  const [guess, setGuess] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { peers, toggleMute, isMuted } = useVoiceChat(socket, room.code, true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentPlayer = room.players.find(p => p.socketId === socket?.id);
  const isDrawer = currentPlayer?.isDrawer || false;

  useEffect(() => {
    if (!socket) return;

    socket.on('game:chat', (msg) => {
      setMessages(prev => [...prev, { ...msg, id: Math.random().toString() }]);
    });

    socket.on('game:correct-guess', (data) => {
      setMessages(prev => [...prev, { ...data, message: 'guessed the word!', isCorrect: true, id: Math.random().toString() }]);
      if (data.userId === socket.id) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#EC4899', '#10B981']
        });
      }
    });

    return () => {
      socket.off('game:chat');
      socket.off('game:correct-guess');
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    socket?.emit('game:guess', { code: room.code, guess: guess.trim() });
    setGuess('');
  };

  const handleClear = () => {
    socket?.emit('draw:clear', { code: room.code });
  };

  return (
    <div className="h-screen flex flex-col p-4 gap-4 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between glass px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest block">Round</span>
            <span className="text-xl font-bold text-white">{room.currentRound}/{room.settings.roundsCount * room.players.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {isDrawer ? (
            <div className="text-center">
              <span className="text-xs text-secondary uppercase tracking-widest block font-bold animate-pulse">Your word to draw</span>
              <span className="text-3xl font-black text-white tracking-widest uppercase">{room.currentWord}</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xs text-gray-500 uppercase tracking-widest block">Guess the word</span>
              <div className="flex gap-1">
                {room.currentWord?.split('').map((_, i) => (
                  <div key={i} className="w-4 h-1 bg-white/20 rounded-full mt-2" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Timer className={`${room.roundTimer < 10 ? 'text-red-500 animate-bounce' : 'text-accent'}`} />
            <span className={`text-3xl font-mono font-black ${room.roundTimer < 10 ? 'text-red-500' : 'text-white'}`}>
              {room.roundTimer}
            </span>
          </div>
          <button 
            onClick={toggleMute}
            className={`p-3 rounded-xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-accent/10 border-accent/50 text-accent'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Sidebar - Players */}
        <div className="w-64 glass rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Players</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {room.players.sort((a,b) => b.score - a.score).map((player, idx) => (
              <div 
                key={player.id}
                className={`relative flex items-center gap-3 p-3 rounded-2xl transition-all ${player.socketId === socket?.id ? 'bg-white/10 border border-white/10' : ''}`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-gray-700 to-gray-800 border ${player.isDrawer ? 'border-secondary shadow-neon-pink' : 'border-white/10'}`}>
                    {player.nickname[0].toUpperCase()}
                  </div>
                  {player.isDrawer && (
                    <div className="absolute -top-2 -right-2 bg-secondary text-white p-1 rounded-full shadow-lg">
                      <Palette size={12} strokeWidth={3} />
                    </div>
                  )}
                  {idx === 0 && player.score > 0 && (
                    <div className="absolute -top-3 -left-3 text-yellow-400">
                      <Crown size={16} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-sm truncate">{player.nickname}</span>
                  <span className="block text-xs font-mono text-primary">{player.score} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 relative">
            <Canvas 
              code={room.code} 
              isDrawer={isDrawer} 
              brushColor={brushColor} 
              brushSize={brushSize} 
            />
            
            {/* Draw Controls overlay */}
            {isDrawer && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl border-white/20"
              >
                <div className="flex items-center gap-3">
                  {['#FFFFFF', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#F59E0B'].map(color => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${brushColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-3">
                  {[2, 5, 10, 20].map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center ${brushSize === size ? 'ring-2 ring-primary' : ''}`}
                      style={{ width: size + 16, height: size + 16 }}
                    >
                      <div className="bg-white rounded-full" style={{ width: size, height: size }} />
                    </button>
                  ))}
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setBrushColor('eraser')} // Handle eraser logic in canvas
                    className={`p-2 rounded-lg hover:bg-white/10 ${brushColor === 'eraser' ? 'text-primary' : 'text-gray-400'}`}
                  >
                    <Eraser size={20} />
                  </button>
                  <button onClick={handleClear} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
                    <Trash2 size={20} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
                    <Undo2 size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Chat */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex-1 glass rounded-3xl flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-500" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Guess Chat</h3>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-2xl text-sm ${
                    msg.isCorrect 
                      ? 'bg-accent/20 border border-accent/30 text-accent font-bold' 
                      : 'bg-black/20 border border-white/5'
                  }`}
                >
                  <span className="text-xs text-gray-500 block mb-1 uppercase tracking-tighter">
                    {msg.nickname}
                  </span>
                  {msg.message}
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/20">
              <form onSubmit={handleSendGuess} className="relative">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={isDrawer}
                  placeholder={isDrawer ? "You're drawing!" : "Type your guess..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isDrawer || !guess.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors disabled:text-gray-600"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
