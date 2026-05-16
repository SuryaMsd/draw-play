# 🎨 Doodle Play - Modern Multiplayer Drawing Game

Doodle Play is a high-performance, real-time drawing and guessing game built with a modern stack. It features glassmorphism UI, low-latency drawing synchronization, and integrated WebRTC voice chat.

## 🚀 Features

- **Real-time Multiplayer**: 2-4 players with instant synchronization using Socket.IO.
- **Shared Canvas**: Advanced drawing tools (brush size, colors, eraser, undo).
- **Voice Chat**: Peer-to-peer audio communication via WebRTC.
- **Dynamic Gameplay**: Round rotation, point system based on speed, and real-time chat.
- **Premium UI**: Dark neon theme with glassmorphism and smooth Framer Motion animations.
- **Production Ready**: Full Docker & Render configuration included.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, Socket.IO.
- **Database**: PostgreSQL with Prisma ORM.
- **Communication**: WebRTC for voice, Socket.IO for state.

## 📦 Project Structure

```text
/client       # React frontend
/server       # Node.js backend
/prisma       # Database schema
render.yaml   # Production deployment config
```

## 🛠 Local Setup

### 1. Database
Ensure you have a PostgreSQL instance running and set `DATABASE_URL` in `server/.env`.

### 2. Backend
```bash
cd server
npm install
npx prisma generate
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

## 🌍 Deployment

This project is configured for **Render**.

1. Connect your GitHub repository to Render.
2. Render will automatically detect `render.yaml`.
3. Ensure you provide the following environment variables in the Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET` (for future auth expansion)
   - `TURN_SERVER_URL` (optional, for better WebRTC reliability)

## 📄 License

MIT
