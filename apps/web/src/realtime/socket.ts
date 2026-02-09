import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@skid/shared/events';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(token: string): AppSocket {
  const socket = io(SOCKET_URL, {
    transports: ['websocket']
  }) as AppSocket;

  socket.on('connect', () => {
    socket.emit('auth', { token });
  });

  return socket;
}
