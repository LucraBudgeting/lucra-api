import { FastifyInstance, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/plaid';

export default async function Plaid(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/link_token`,
    handler: async (_request, reply) => {
      reply.send({ message: 'Hello from Plaid' });
    },
    preHandler: [fastify.authPrehandler],
  });
}
