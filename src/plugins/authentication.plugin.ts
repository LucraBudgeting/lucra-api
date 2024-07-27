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
      logger.error('authPrehandler Error: ', JSON.stringify(error, null, 4));
      logger.error('authPrehandler Error Auth Header: ', request.headers?.authorization);

      throw new ForbiddenError('Invalid Token');
    }
  };

  fastify.decorate('authPrehandler', authPrehandler);
});
