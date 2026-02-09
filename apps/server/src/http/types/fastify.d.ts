import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; accountId: string };
    user: { userId: string; accountId: string };
  }
}
