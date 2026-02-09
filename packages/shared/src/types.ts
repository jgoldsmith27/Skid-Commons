export type AuthorType = 'HUMAN' | 'ASSISTANT' | 'SYSTEM';
export type ParticipantRole = 'OWNER' | 'MEMBER';

export interface UserView {
  id: string;
  accountId: string;
  displayName: string;
}

export interface ChatSummary {
  id: string;
  title: string | null;
  createdAt: string;
  createdByUserId: string;
}

export interface ChatView extends ChatSummary {
  participants: UserView[];
}

export interface MessageView {
  id: string;
  chatId: string;
  authorUserId: string | null;
  authorType: AuthorType;
  authorDisplayName: string;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserView;
}

export interface ChatsResponse {
  owned: ChatSummary[];
  shared: ChatSummary[];
}
