import { FastifyInstance, RouteOptions } from 'fastify';
import { GetBankAccounts, GetCategoryList } from '@/modules/bank/bank.accounts.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/bank';

export default async function Bank(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/accounts`,
    handler: GetBankAccounts,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/category-list`,
    handler: GetCategoryList,
  });
}
