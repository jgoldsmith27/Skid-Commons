import type { DomainEventMap, EventBus } from '../../domain/events/EventBus.js';

// Observer / Pub-Sub Pattern: lightweight typed in-process event emitter.
export class InMemoryEventBus implements EventBus {
  constructor(private readonly onEmit: <K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]) => void) {}

  emit<K extends keyof DomainEventMap>(event: K, payload: DomainEventMap[K]): void {
    this.onEmit(event, payload);
  }
}
