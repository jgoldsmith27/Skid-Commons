import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().default('http://localhost:5173')
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse(process.env);
