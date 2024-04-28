import { FastifyInstance, RouteOptions } from 'fastify';
import { dbClient } from '@/data/db.client';
import { HttpMethods } from '@/utils/HttpMethods';

export default async function Health(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: '/health',
    handler: async (_request, _reply) => {
      await dbClient.$queryRaw`SELECT 1`;
      return { db_status: 'ok' };
    },
  });
}
