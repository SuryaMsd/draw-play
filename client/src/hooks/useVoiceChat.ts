import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface Peer {
  connection: RTCPeerConnection;
  stream: MediaStream;
}

export const useVoiceChat = (socket: Socket | null, code: string, isEnabled: boolean) => {
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const peersRef = useRef<Map<string, Peer>>(new Map());

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Production TURN servers would be added here via env vars
    ],
  };

  useEffect(() => {
    if (!socket || !isEnabled) return;

    const initVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        socket.on('voice:signal', async ({ sender, signal }) => {
          let peer = peersRef.current.get(sender);
          if (!peer) {
            peer = createPeer(sender, stream);
          }

          if (signal.type === 'offer') {
            await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await peer.connection.createAnswer();
            await peer.connection.setLocalDescription(answer);
            socket.emit('voice:signal', { code, target: sender, signal: answer });
          } else if (signal.type === 'answer') {
            await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
          } else if (signal.candidate) {
            await peer.connection.addIceCandidate(new RTCIceCandidate(signal));
          }
        });

        // Request offers from existing peers
        socket.emit('voice:ready', { code });
      } catch (err) {
        console.error('Failed to get user media:', err);
      }
    };

    const createPeer = (targetId: string, stream: MediaStream) => {
      const pc = new RTCPeerConnection(iceServers);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('voice:signal', { code, target: targetId, signal: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        const peer: Peer = {
          connection: pc,
          stream: event.streams[0],
        };
        peersRef.current.set(targetId, peer);
        setPeers(new Map(peersRef.current));
      };

      const peer: Peer = { connection: pc, stream: new MediaStream() };
      peersRef.current.set(targetId, peer);
      return peer;
    };

    initVoice();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      peersRef.current.forEach((peer) => peer.connection.close());
      socket.off('voice:signal');
    };
  }, [socket, code, isEnabled]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      socket?.emit('voice:toggle-mute', { code, isMuted: !audioTrack.enabled });
    }
  };

  return { peers, localStream, isMuted, toggleMute };
};
