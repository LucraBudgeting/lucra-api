import { FastifyInstance, RouteOptions } from 'fastify';
import {
  qsCreatePlaidLinkToken,
  qsExchangePlaidToken,
  qsGetRecurringTransactions,
  qsGetTransactions,
} from '@/modules/plaid/plaid.qs.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/plaid/qs';

export default async function Plaid(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/link_token`,
    handler: qsCreatePlaidLinkToken,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/exchange_token/:publicToken`,
    handler: qsExchangePlaidToken,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/transactions`,
    handler: qsGetTransactions,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/recurring_transactions`,
    handler: qsGetRecurringTransactions,
  });
}
