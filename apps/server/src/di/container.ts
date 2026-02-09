import type { FastifyInstance } from 'fastify';
import { prisma } from '../infra/prisma/client.js';
import { PrismaUserRepository } from '../infra/repositories/PrismaUserRepository.js';
import { PrismaChatRepository } from '../infra/repositories/PrismaChatRepository.js';
import { PrismaMessageRepository } from '../infra/repositories/PrismaMessageRepository.js';
import { InMemoryEventBus } from '../infra/realtime/socketEvents.js';
import { getTypedSocketServer } from '../infra/realtime/socketServer.js';
import { OpenAIClient } from '../infra/llm/OpenAIClient.js';
import { AuthService } from '../domain/services/AuthService.js';
import { ChatPolicyService } from '../domain/services/ChatPolicyService.js';
import { ChatService } from '../domain/services/ChatService.js';
import { MessageService } from '../domain/services/MessageService.js';
import { AuthController } from '../http/controllers/authController.js';
import { ChatController } from '../http/controllers/chatController.js';
import { MessageController } from '../http/controllers/messageController.js';
import type { AppEnv } from '../config/env.js';

export interface AppContainer {
  authController: AuthController;
  chatController: ChatController;
  messageController: MessageController;
  chatPolicyService: ChatPolicyService;
}

// Factory Pattern: central dependency assembly and manual DI container.
export function buildContainer(fastify: FastifyInstance, env: AppEnv): AppContainer {
  const userRepository = new PrismaUserRepository(prisma);
  const chatRepository = new PrismaChatRepository(prisma);
  const messageRepository = new PrismaMessageRepository(prisma);

  const io = getTypedSocketServer(fastify);
  const eventBus = new InMemoryEventBus((event, payload) => {
    if (event === 'chat.messageCreated') {
      const typedPayload = payload as { chatId: string; message: import('@skid/shared/types').MessageView };
      io.to(typedPayload.chatId).emit('chat:messageCreated', typedPayload);
      return;
    }

    if (event === 'chat.participantAdded') {
      const typedPayload = payload as { chatId: string; user: import('@skid/shared/types').UserView };
      io.to(typedPayload.chatId).emit('chat:participantAdded', typedPayload);
    }
  });

  const tokenSigner = {
    sign: (payload: { userId: string; accountId: string }) => fastify.jwt.sign(payload)
  };

  const llmClient = new OpenAIClient(env.OPENAI_API_KEY);
  const chatPolicyService = new ChatPolicyService(chatRepository);

  const authService = new AuthService(userRepository, tokenSigner);
  const chatService = new ChatService(chatRepository, userRepository, chatPolicyService, eventBus);
  const messageService = new MessageService(
    messageRepository,
    chatRepository,
    chatPolicyService,
    eventBus,
    llmClient
  );

  return {
    authController: new AuthController(authService),
    chatController: new ChatController(chatService),
    messageController: new MessageController(messageService),
    chatPolicyService
  };
}
