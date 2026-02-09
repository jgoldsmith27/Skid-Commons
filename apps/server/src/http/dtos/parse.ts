import type { ZodSchema } from 'zod';

export function parseDto<T>(schema: ZodSchema<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid request payload: ${issues.join('; ')}`);
  }

  return parsed.data;
}
