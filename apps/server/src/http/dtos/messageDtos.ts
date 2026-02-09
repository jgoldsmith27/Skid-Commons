import { z } from 'zod';

export const SendMessageDto = z.object({
  content: z.string().trim().min(1).max(5000)
});

export type SendMessageBodyDto = z.infer<typeof SendMessageDto>;
