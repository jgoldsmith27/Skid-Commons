// Adapter Pattern: vendor-agnostic interface for LLM providers.
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMClient {
  generateReply(messages: LLMMessage[]): Promise<string>;
}
