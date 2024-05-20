import { GetBankAccounts } from '@/modules/bank/bank.accounts.controller';
import { HttpMethods } from '@/utils/HttpMethods';
import { FastifyInstance, RouteOptions } from 'fastify';

const basePath = '/bank';
export default async function Bank(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/accounts`,
    handler: GetBankAccounts,
    preHandler: [fastify.authPrehandler],
  });
}
