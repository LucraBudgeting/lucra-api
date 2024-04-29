import { User } from '@prisma/client';
import { FastifyInstance, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { ForbiddenError } from '@/exceptions/error';

export default fastifyPlugin(async (fastify: FastifyInstance, _: unknown) => {
  const authPrehandler = async (request: FastifyRequest) => {
    try {
      if (!request.headers?.authorization?.includes('Bearer')) {
        throw new ForbiddenError('No Authorization Header');
      }

      const payload = (await request.jwtVerify()) as { user: User };

      request.user = payload.user;
    } catch (error) {
      console.error('authPrehandler Error: ', JSON.stringify(error, null, 4));
      console.error('authPrehandler Error Auth Header: ', request.headers?.authorization);

      throw new ForbiddenError('Invalid Token');
    }
  };

  fastify.decorate('authPrehandler', authPrehandler);
});
