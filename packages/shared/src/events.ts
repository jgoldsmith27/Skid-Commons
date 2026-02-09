import type { MessageView, UserView } from './types.js';

export interface ClientToServerEvents {
  auth: (payload: { token: string }) => void;
  'chat:join': (payload: { chatId: string }) => void;
  'chat:leave': (payload: { chatId: string }) => void;
}

export interface ServerToClientEvents {
  'chat:messageCreated': (payload: { chatId: string; message: MessageView }) => void;
  'chat:participantAdded': (payload: { chatId: string; user: UserView }) => void;
  error: (payload: { code: string; message: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
}
