import type { ChatRepository } from '../repositories/ChatRepository.js';

// Service Layer Pattern: policy service centralizing authorization rules.
export class ChatPolicyService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async ensureParticipant(chatId: string, userId: string): Promise<void> {
    const isParticipant = await this.chatRepository.isParticipant(chatId, userId);
    if (!isParticipant) {
      throw new Error('User is not a participant of this chat');
    }
  }

  async ensureOwner(chatId: string, userId: string): Promise<void> {
    const role = await this.chatRepository.getParticipantRole(chatId, userId);
    if (role !== 'OWNER') {
      throw new Error('Only owner can perform this action');
    }
  }
}
