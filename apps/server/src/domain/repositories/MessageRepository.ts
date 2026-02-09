import type { AuthorType } from '@skid/shared/types';
import type { MessageEntity } from '../entities/models.js';

export interface MessageWithAuthor extends MessageEntity {
  authorDisplayName: string;
}

export interface MessageRepository {
  create(input: {
    chatId: string;
    authorUserId: string | null;
    authorType: AuthorType;
    content: string;
  }): Promise<MessageWithAuthor>;
  listByChat(chatId: string): Promise<MessageWithAuthor[]>;
  listRecentByChat(chatId: string, limit: number): Promise<MessageWithAuthor[]>;
}
