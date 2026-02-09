import type { FastifyInstance } from 'fastify';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from '@skid/shared/events';
import type { ChatPolicyService } from '../../domain/services/ChatPolicyService.js';

export function setupSocketHandlers(fastify: FastifyInstance, policy: ChatPolicyService): void {
  const io = getTypedSocketServer(fastify);

  io.on('connection', (socket) => {
    socket.on('auth', async (payload: { token: string }) => {
      try {
        const verified = fastify.jwt.verify<{ userId: string; accountId: string }>(payload.token);
        socket.data.userId = verified.userId;
      } catch {
        socket.emit('error', { code: 'AUTH_FAILED', message: 'Invalid token' });
      }
    });

    socket.on('chat:join', async (payload: { chatId: string }) => {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit('error', { code: 'UNAUTHENTICATED', message: 'Authenticate first' });
        return;
      }

      try {
        await policy.ensureParticipant(payload.chatId, userId);
        await socket.join(payload.chatId);
      } catch {
        socket.emit('error', { code: 'FORBIDDEN', message: 'Cannot join this chat' });
      }
    });

    socket.on('chat:leave', async (payload: { chatId: string }) => {
      await socket.leave(payload.chatId);
    });
  });
}

export function getTypedSocketServer(fastify: FastifyInstance) {
  return fastify.io as import('socket.io').Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
}
