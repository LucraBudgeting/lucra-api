import { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';
import { CreatePlaidLinkToken, SyncAccounts } from '@/modules/plaid/plaid.controller';
import { webHookBase } from './_route.constants';
import { logger } from '@/libs/logger';
import { HandleWalletTransactionWehook } from '@/modules/plaid/plaid.webhook.controller';

const basePath = '/plaid';

export default async function Plaid(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/link_token`,
    handler: CreatePlaidLinkToken,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/sync_accounts/:publicToken`,
    handler: SyncAccounts,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${webHookBase}${basePath}/wallet_transaction`,
    handler: HandleWalletTransactionWehook,
    preHandler: [fastify.authPrehandler],
  });
}
