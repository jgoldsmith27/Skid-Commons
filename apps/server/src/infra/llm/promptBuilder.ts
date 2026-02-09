import type { MessageWithAuthor } from '../../domain/repositories/MessageRepository.js';
import type { UserEntity } from '../../domain/entities/models.js';
import type { LLMMessage } from './LLMClient.js';

function buildSystemPrompt(participants: UserEntity[]): string {
  if (participants.length <= 1) {
    return [
      'You are Skid Commons assistant.',
      'Be concise, helpful, and context-aware.',
      'Never invent facts. Ask clarifying questions when needed.'
    ].join(' ');
  }

  const roster = participants
    .map((participant) => `${participant.displayName} (userId: ${participant.id})`)
    .join(', ');

  return [
    'You are Skid Commons assistant in a multi-user chat.',
    `Participants: ${roster}.`,
    'Multiple humans may speak; track who said what using metadata.',
    'Respond naturally to the ongoing group conversation without meta commentary.'
  ].join(' ');
}

export function buildConversationMessages(input: {
  participants: UserEntity[];
  recentMessages: MessageWithAuthor[];
}): LLMMessage[] {
  const systemPrompt = buildSystemPrompt(input.participants);
  const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const message of input.recentMessages) {
    if (message.authorType === 'ASSISTANT') {
      messages.push({ role: 'assistant', content: message.content });
      continue;
    }

    if (message.authorType === 'SYSTEM') {
      messages.push({ role: 'system', content: message.content });
      continue;
    }

    const name = message.authorDisplayName;
    const userId = message.authorUserId ?? 'unknown';
    messages.push({
      role: 'user',
      content: `[speaker displayName=${name} userId=${userId}] ${message.content}`
    });
  }

  return messages;
}
