import type { ChatSummary, UserView } from '@skid/shared/types';
import type { ChatRepository } from '../repositories/ChatRepository.js';
import type { UserRepository } from '../repositories/UserRepository.js';
import type { EventBus } from '../events/EventBus.js';
import { ChatPolicyService } from './ChatPolicyService.js';

// Service Layer Pattern: chat business logic and invariants.
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly policy: ChatPolicyService,
    private readonly eventBus: EventBus
  ) {}

  private toSummary(chat: {
    id: string;
    title: string | null;
    createdAt: Date;
    createdByUserId: string;
  }): ChatSummary {
    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      createdByUserId: chat.createdByUserId
    };
  }

  async listChats(userId: string): Promise<{ owned: ChatSummary[]; shared: ChatSummary[] }> {
    const result = await this.chatRepository.listForUser(userId);
    return {
      owned: result.owned.map((chat) => this.toSummary(chat)),
      shared: result.shared.map((chat) => this.toSummary(chat))
    };
  }

  async createChat(userId: string, title?: string): Promise<ChatSummary> {
    const chat = await this.chatRepository.create({
      createdByUserId: userId,
      ...(title ? { title } : {})
    });
    await this.chatRepository.addParticipant({ chatId: chat.id, userId, role: 'OWNER' });
    return this.toSummary(chat);
  }

  async shareChat(input: { chatId: string; sharerUserId: string; targetAccountId: string }): Promise<void> {
    await this.policy.ensureOwner(input.chatId, input.sharerUserId);

    const targetUser = await this.userRepository.findByAccountId(input.targetAccountId);
    if (!targetUser) {
      throw new Error('Target account does not exist');
    }

    await this.chatRepository.addParticipant({
      chatId: input.chatId,
      userId: targetUser.id,
      role: 'MEMBER'
    });

    const userView: UserView = {
      id: targetUser.id,
      accountId: targetUser.accountId,
      displayName: targetUser.displayName
    };

    this.eventBus.emit('chat.participantAdded', {
      chatId: input.chatId,
      user: userView
    });
  }

  async listParticipants(chatId: string, requesterUserId: string): Promise<UserView[]> {
    await this.policy.ensureParticipant(chatId, requesterUserId);
    const participants = await this.chatRepository.listParticipants(chatId);

    return participants.map((participant) => ({
      id: participant.user.id,
      accountId: participant.user.accountId,
      displayName: participant.user.displayName
    }));
  }
}
