import { FastifyInstance, RouteOptions } from 'fastify';
import {
  ApplyRulesToTransactions,
  CreateTransactionRule,
  DeleteTransactionRule,
  GetTransactionRules,
  UpdateTransactionRule,
  AddMerchantToRule,
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

  fastify.route({
    method: HttpMethods.PUT,
    url: basePath,
    handler: UpdateTransactionRule,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.DELETE,
    url: `${basePath}/:id`,
    handler: DeleteTransactionRule,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.PUT,
    url: `${basePath}/overwrite/auto-apply`,
    handler: CreateTransactionRule,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.PUT,
    url: `${basePath}/overwrite/apply-rules`,
    handler: ApplyRulesToTransactions,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.PUT,
    url: `${basePath}/merchant/:transactionId/:categoryId`,
    handler: AddMerchantToRule,
    preHandler: [fastify.authPrehandler],
  });
}
