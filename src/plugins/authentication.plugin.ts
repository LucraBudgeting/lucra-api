import { User } from '@prisma/client';
import { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { ForbiddenError } from '@/exceptions/error';
import { logger } from '@/libs/logger';

export default fastifyPlugin(async (fastify: FastifyInstance) => {
  const authPrehandler = async (request: FastifyRequest) => {
    try {
      if (!request.headers?.authorization?.includes('Bearer')) {
        throw new ForbiddenError('No Authorization Header');
      }

      const payload = (await request.jwtVerify()) as { user: User };

      request.user = payload.user;
    } catch (error) {
      const errorPayload = {
        authHeader: request.headers?.authorization,
        error: JSON.stringify(error, null, 4),
        requestUrl: request.url,
      };
      logger.warn(`authPrehandler Error: `, errorPayload);

      throw new ForbiddenError('Invalid Token');
    }
  };

  fastify.decorate('authPrehandler', authPrehandler);
});
