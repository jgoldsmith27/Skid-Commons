import { z } from 'zod';

export const CreateChatDto = z.object({
  title: z.string().trim().min(1).max(120).optional()
});

export const ShareChatDto = z.object({
  targetAccountId: z.string().trim().min(1)
});

export const ChatIdParamsDto = z.object({
  chatId: z.string().uuid()
});

export type CreateChatBodyDto = z.infer<typeof CreateChatDto>;
export type ShareChatBodyDto = z.infer<typeof ShareChatDto>;
export type ChatIdParams = z.infer<typeof ChatIdParamsDto>;
