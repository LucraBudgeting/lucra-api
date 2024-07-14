import { FastifyInstance, FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';
import { CreatePlaidLinkToken, SyncAccounts } from '@/modules/plaid/plaid.controller';
import { webSocketBase } from './_route.constants';

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
    url: `${webSocketBase}${basePath}/sync_transactions`,
    handler: (_request: FastifyRequest, reply: FastifyReply) => {
      reply.status(200).send({ message: 'Sync Transactions' });
    },
    preHandler: [fastify.authPrehandler],
  });
}
