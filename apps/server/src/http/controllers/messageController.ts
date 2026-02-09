import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MessageService } from '../../domain/services/MessageService.js';
import { ChatIdParamsDto } from '../dtos/chatDtos.js';
import { SendMessageDto } from '../dtos/messageDtos.js';
import { parseDto } from '../dtos/parse.js';

export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  listMessages = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = parseDto(ChatIdParamsDto, request.params);
    const messages = await this.messageService.listMessages(params.chatId, request.user.userId);
    reply.send(messages);
  };

  sendMessage = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = parseDto(ChatIdParamsDto, request.params);
    const body = parseDto(SendMessageDto, request.body);

    const message = await this.messageService.sendHumanMessage({
      chatId: params.chatId,
      authorUserId: request.user.userId,
      content: body.content
    });

    reply.send(message);
  };
}
