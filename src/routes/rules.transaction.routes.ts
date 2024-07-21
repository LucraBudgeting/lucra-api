import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CreateTransactionRule,
  GetTransactionRules,
} from '@/modules/rules/rules.transaction.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/rule/transaction';

export default async function TransactionRules(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: basePath,
    handler: GetTransactionRules,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.POST,
    url: basePath,
    handler: CreateTransactionRule,
    preHandler: [fastify.authPrehandler],
  });
}
