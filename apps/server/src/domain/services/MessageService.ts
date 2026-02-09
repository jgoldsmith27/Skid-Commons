import type { MessageView } from '@skid/shared/types';
import type { MessageRepository } from '../repositories/MessageRepository.js';
import type { ChatRepository } from '../repositories/ChatRepository.js';
import type { EventBus } from '../events/EventBus.js';
import type { LLMClient } from '../../infra/llm/LLMClient.js';
import { buildConversationMessages } from '../../infra/llm/promptBuilder.js';
import { ChatPolicyService } from './ChatPolicyService.js';

// Service Layer Pattern: message workflow including persistence, pub-sub, and AI reply.
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly policy: ChatPolicyService,
    private readonly eventBus: EventBus,
    private readonly llmClient: LLMClient
  ) {}

  private toView(message: {
    id: string;
    chatId: string;
    authorUserId: string | null;
    authorType: 'HUMAN' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt: Date;
    authorDisplayName: string;
  }): MessageView {
    return {
      id: message.id,
      chatId: message.chatId,
      authorUserId: message.authorUserId,
      authorType: message.authorType,
      authorDisplayName: message.authorDisplayName,
      content: message.content,
      createdAt: message.createdAt.toISOString()
    };
  }

  async listMessages(chatId: string, requesterUserId: string): Promise<MessageView[]> {
    await this.policy.ensureParticipant(chatId, requesterUserId);
    const messages = await this.messageRepository.listByChat(chatId);
    return messages.map((message) => this.toView(message));
  }

  async sendHumanMessage(input: {
    chatId: string;
    authorUserId: string;
    content: string;
  }): Promise<MessageView> {
    await this.policy.ensureParticipant(input.chatId, input.authorUserId);

    const humanMessage = await this.messageRepository.create({
      chatId: input.chatId,
      authorUserId: input.authorUserId,
      authorType: 'HUMAN',
      content: input.content
    });

    const humanView = this.toView(humanMessage);
    this.eventBus.emit('chat.messageCreated', {
      chatId: input.chatId,
      message: humanView
    });

    void this.generateAndPersistAssistantReply(input.chatId);

    return humanView;
  }

  private async generateAndPersistAssistantReply(chatId: string): Promise<void> {
    const recentMessages = await this.messageRepository.listRecentByChat(chatId, 30);
    const participants = (await this.chatRepository.listParticipants(chatId)).map((x) => x.user);

    const conversation = buildConversationMessages({
      participants,
      recentMessages
    });

    const replyContent = await this.llmClient.generateReply(conversation);

    const assistantMessage = await this.messageRepository.create({
      chatId,
      authorUserId: null,
      authorType: 'ASSISTANT',
      content: replyContent
    });

    this.eventBus.emit('chat.messageCreated', {
      chatId,
      message: this.toView(assistantMessage)
    });
  }
}
