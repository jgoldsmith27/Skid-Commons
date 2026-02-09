import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ChatService } from '../../domain/services/ChatService.js';
import { ChatIdParamsDto, CreateChatDto, ShareChatDto } from '../dtos/chatDtos.js';
import { parseDto } from '../dtos/parse.js';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  listChats = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user.userId;
    const result = await this.chatService.listChats(userId);
    reply.send(result);
  };

  createChat = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = parseDto(CreateChatDto, request.body);
    const userId = request.user.userId;
    const chat = await this.chatService.createChat(userId, body.title);
    reply.send(chat);
  };

  shareChat = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = parseDto(ChatIdParamsDto, request.params);
    const body = parseDto(ShareChatDto, request.body);
    const sharerUserId = request.user.userId;

    await this.chatService.shareChat({
      chatId: params.chatId,
      sharerUserId,
      targetAccountId: body.targetAccountId
    });

    reply.send({ ok: true });
  };

  listParticipants = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = parseDto(ChatIdParamsDto, request.params);
    const participants = await this.chatService.listParticipants(params.chatId, request.user.userId);
    reply.send(participants);
  };
}
