import { join } from 'path';
import Fastify, { FastifyError, FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyWs from '@fastify/websocket';
import { schemaErrorFormatter } from './utils/schemaErrorFormatter';
import { API_URL, CREDENTIALS, PORT, SECRET_KEY } from './config';
import { schema } from './utils/validateEnv';
import { defaultErrorMessage } from './constants';
import '@/extensions';

async function startServer() {
  const app: FastifyInstance = Fastify({
    schemaErrorFormatter,
    ajv: {
      customOptions: {
        coerceTypes: false,
        allErrors: true,
      },
      plugins: [],
    },
    logger: true,
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  const port: number = Number(PORT) ?? 3001;

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

  // Init WebSocket
  app.register(fastifyWs);

  // Initialize Routes
  await app.register(AutoLoad, {
    dir: join(__dirname, '/routes'),
    dirNameRoutePrefix: false,
    options: { prefix: `/api` },
  });

  // Initialize Error Handling
  app.setErrorHandler((error: FastifyError, request, reply) => {
    try {
      const status: number = error.statusCode ?? 500;
      const message: string =
        status === 500 ? defaultErrorMessage : error.message ?? defaultErrorMessage;

      app.log.error(
        `[${request.method}] ${request.url} >> StatusCode:: ${status}, Message:: ${message}`
      );

      return reply.status(status).send({ error: true, message });
    } catch (error) {
      return reply
        .status(500)
        .send({ error: true, message: `Exception could not be handled: ${error}` });
    }
  });

  // Start listening
  try {
    await app.listen({ port, host: '0.0.0.0' });
    // await dbClient.$connect();
    console.log(`Server running on port ${port}`);
    console.log(`Preview: ${API_URL}`);
    // schedulePing();
  } catch (err) {
    app.log.error('APP ERROR', err);
    console.error(err);
    // dbClient.$disconnect();
    process.exit(1);
  }

  return app;
}

export default startServer;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
