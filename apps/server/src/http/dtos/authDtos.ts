import { z } from 'zod';

// DTO Pattern: runtime validation + inferred TypeScript payload types.
export const RegisterDto = z.object({
  accountId: z.string().trim().min(1),
  displayName: z.string().trim().min(1)
});

export const LoginDto = z.object({
  accountId: z.string().trim().min(1)
});

export type RegisterBodyDto = z.infer<typeof RegisterDto>;
export type LoginBodyDto = z.infer<typeof LoginDto>;
