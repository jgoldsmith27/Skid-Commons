import type { FastifyInstance } from 'fastify';
import { requireAuth } from './middleware/auth.js';
import type { AppContainer } from '../di/container.js';

// Controller/Router Pattern: transport wiring kept in route module.
export async function registerRoutes(fastify: FastifyInstance, container: AppContainer): Promise<void> {
  fastify.post('/api/auth/register', container.authController.register);
  fastify.post('/api/auth/login', container.authController.login);

  fastify.register(async (protectedScope) => {
    protectedScope.addHook('preHandler', requireAuth);

    protectedScope.get('/api/chats', container.chatController.listChats);
    protectedScope.post('/api/chats', container.chatController.createChat);
    protectedScope.post('/api/chats/:chatId/share', container.chatController.shareChat);
    protectedScope.get('/api/chats/:chatId/participants', container.chatController.listParticipants);

    protectedScope.get('/api/chats/:chatId/messages', container.messageController.listMessages);
    protectedScope.post('/api/chats/:chatId/messages', container.messageController.sendMessage);
  });
}
