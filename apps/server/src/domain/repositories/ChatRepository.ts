import type { ParticipantRole } from '@skid/shared/types';
import type { ChatEntity, UserEntity } from '../entities/models.js';

export interface ChatRepository {
  create(input: { title?: string; createdByUserId: string }): Promise<ChatEntity>;
  listForUser(userId: string): Promise<{ owned: ChatEntity[]; shared: ChatEntity[] }>;
  findById(chatId: string): Promise<ChatEntity | null>;
  addParticipant(input: { chatId: string; userId: string; role: ParticipantRole }): Promise<void>;
  getParticipantRole(chatId: string, userId: string): Promise<ParticipantRole | null>;
  isParticipant(chatId: string, userId: string): Promise<boolean>;
  listParticipants(chatId: string): Promise<Array<{ user: UserEntity; role: ParticipantRole }>>;
}
