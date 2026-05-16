import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';

interface CanvasProps {
  code: string;
  isDrawer: boolean;
  brushColor: string;
  brushSize: number;
}

export const Canvas: React.FC<CanvasProps> = ({ code, isDrawer, brushColor, brushSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const drawLine = useCallback((x0: number, y0: number, x1: number, y1: number, color: string, size: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw:start', (data) => {
      lastPos.current = { x: data.x, y: data.y };
    });

    socket.on('draw:move', (data) => {
      drawLine(lastPos.current.x, lastPos.current.y, data.x, data.y, data.color || brushColor, data.size || brushSize);
      lastPos.current = { x: data.x, y: data.y };
    });

    socket.on('draw:clear', () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw:start');
      socket.off('draw:move');
      socket.off('draw:clear');
    };
  }, [socket, drawLine, brushColor, brushSize]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer) return;
    const pos = getPos(e);
    setIsDrawing(true);
    lastPos.current = pos;
    socket?.emit('draw:start', { code, ...pos, color: brushColor, size: brushSize });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawer) return;
    const pos = getPos(e);
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y, brushColor, brushSize);
    socket?.emit('draw:move', { code, ...pos, color: brushColor, size: brushSize });
    lastPos.current = pos;
  };

  const handleEnd = () => {
    setIsDrawing(false);
    socket?.emit('draw:end', { code });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Save current content
        const temp = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        // Restore content
        if (temp) canvas.getContext('2d')?.putImageData(temp, 0, 0);
      }
    };

    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseOut={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      className="w-full h-full glass-dark rounded-xl shadow-2xl"
    />
  );
};
