import { FastifyInstance, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';
import {
  AssociateCategoryToTransaction,
  GetTransaction,
  GetTransactions,
} from '@/modules/transaction/transaction.controller';

const basePath = '/transaction';

export default async function Transaction(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}`,
    handler: GetTransactions,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/:id`,
    handler: GetTransaction,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.PUT,
    url: `${basePath}/:id/category/:categoryId`,
    handler: AssociateCategoryToTransaction,
    preHandler: [fastify.authPrehandler],
  });
}
