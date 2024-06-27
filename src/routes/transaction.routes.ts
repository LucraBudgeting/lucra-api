import { FastifyInstance, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';
import { GetTransactions } from '@/modules/transaction/transaction.controller';

const basePath = '/transaction';

export default async function Transaction(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}`,
    handler: GetTransactions,
    preHandler: [fastify.authPrehandler],
  });
}
