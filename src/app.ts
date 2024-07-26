import { join } from 'path';
import type { IncomingMessage, Server, ServerResponse } from 'http';
import Fastify, { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import { schemaErrorFormatter } from './utils/schemaErrorFormatter';
import { API_URL, CREDENTIALS, PORT, SECRET_KEY } from './config';
import { schema } from './utils/validateEnv';
import '@/extensions';
import { baseLogger, logger } from './libs/logger';
import { globalErrorHandler } from './utils/globalErrorHandler';

const port: number = Number(PORT) ?? 3001;

async function startServer() {
  const app: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse,
    typeof baseLogger,
    TypeBoxTypeProvider
  > = Fastify({
    schemaErrorFormatter,
    ajv: {
      customOptions: {
        coerceTypes: false,
        allErrors: true,
      },
      plugins: [],
    },
    logger: baseLogger,
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Initialize Error Handling
  app.setErrorHandler(globalErrorHandler);

  // Initialize Plugins
  await app.register(fastifyEnv, { dotenv: true, schema });
  await app.register(fastifyCors, {
    origin: true,
    credentials: CREDENTIALS === 'true',
  });
  await app.register(fastifyHelmet);
  await app.register(fastifyJwt, {
    secret: SECRET_KEY ?? '',
    sign: { expiresIn: '7d' },
  });

  await app.register(AutoLoad, {
    dir: join(__dirname, '/plugins'),
    dirNameRoutePrefix: false,
  });

  // Initialize Routes - KEEP THIS AS THE LAST REGISTRED ITEM
  await app.register(AutoLoad, {
    dir: join(__dirname, '/routes'),
    dirNameRoutePrefix: false,
    options: { prefix: `/api` },
  });

  // Start listening
  try {
    await app.listen({ port, host: '0.0.0.0' });
    // await dbClient.$connect();
    logger.warn(`Server running on port ${port}`);
    logger.warn(`Preview: ${API_URL}`);
    // schedulePing();
  } catch (err) {
    logger.error('APP ERROR', err);
    // dbClient.$disconnect();
    process.exit(1);
  }

  return app;
}

export default startServer;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
