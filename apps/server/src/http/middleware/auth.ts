import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify<{ userId: string; accountId: string }>();
  } catch {
    reply.status(401).send({ message: 'Unauthorized' });
  }
}
