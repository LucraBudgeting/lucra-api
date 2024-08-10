import { FastifyInstance, RouteOptions } from 'fastify';
import { GetBillingPortalUrl } from '@/modules/billing/billing.controller';

const basePath = '/billing';

export default async function Billing(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: 'GET',
    url: `${basePath}/portal`,
    handler: GetBillingPortalUrl,
    preHandler: [fastify.authPrehandler],
  });
}
