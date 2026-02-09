import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import fastifySocketIO from 'fastify-socket.io';
import { env } from './config/env.js';
import { buildContainer } from './di/container.js';
import { registerRoutes } from './http/routes.js';
import { setupSocketHandlers } from './infra/realtime/socketServer.js';

async function bootstrap(): Promise<void> {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true
  });

  await fastify.register(sensible);
  await fastify.register(jwt, {
    secret: env.JWT_SECRET
  });

  await fastify.register(fastifySocketIO as never, {
    cors: {
      origin: env.WEB_ORIGIN,
      credentials: true
    }
  });

  const container = buildContainer(fastify, env);

  setupSocketHandlers(fastify, container.chatPolicyService);
  await registerRoutes(fastify, container);

  fastify.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 400;
    reply.status(statusCode).send({ message: error.message });
  });

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
