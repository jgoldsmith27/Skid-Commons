import OpenAI from 'openai';
import type { LLMClient, LLMMessage } from './LLMClient.js';

export class OpenAIClient implements LLMClient {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateReply(messages: LLMMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.5
    });

    return response.choices[0]?.message?.content?.trim() || 'I need a bit more context to respond.';
  }
}
