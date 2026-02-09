import type { AuthorType, ParticipantRole } from '@skid/shared/types';

export interface UserEntity {
  id: string;
  accountId: string;
  displayName: string;
  createdAt: Date;
}

export interface ChatEntity {
  id: string;
  title: string | null;
  createdAt: Date;
  createdByUserId: string;
}

export interface ChatParticipantEntity {
  chatId: string;
  userId: string;
  role: ParticipantRole;
  createdAt: Date;
}

export interface MessageEntity {
  id: string;
  chatId: string;
  authorUserId: string | null;
  authorType: AuthorType;
  content: string;
  createdAt: Date;
}
