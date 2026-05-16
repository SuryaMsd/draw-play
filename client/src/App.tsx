import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Landing } from './pages/Landing';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { Results } from './pages/Results';
import type { Room } from './types/game';
import { AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState('');
  const [view, setView] = useState<'landing' | 'lobby' | 'game' | 'results'>('landing');

  useEffect(() => {
    if (!socket) return;

    socket.on('room:status', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'LOBBY') {
        setView('lobby');
      } else if (updatedRoom.status === 'PLAYING') {
        setView('game');
      } else if (updatedRoom.status === 'ENDED') {
        setView('results');
      }
    });

    socket.on('error', (err) => {
      alert(err.message);
    });

    return () => {
      socket.off('room:status');
      socket.off('error');
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 blur-xl animate-pulse"
            style={{
              width: Math.random() * 300 + 100 + 'px',
              height: Math.random() * 300 + 100 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 5 + 's',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <Landing setNickname={setNickname} nickname={nickname} />
        )}
        {view === 'lobby' && room && (
          <Lobby room={room} nickname={nickname} />
        )}
        {view === 'game' && room && (
          <Game room={room} nickname={nickname} />
        )}
        {view === 'results' && room && (
          <Results room={room} />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
};

export default App;
