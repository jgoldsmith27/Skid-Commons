import type { MessageView, UserView } from '@skid/shared/types';

// Observer / Pub-Sub Pattern: typed domain event bus abstraction.
export interface DomainEventMap {
  'chat.messageCreated': { chatId: string; message: MessageView };
  'chat.participantAdded': { chatId: string; user: UserView };
}

export interface EventBus {
  emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void;
}
