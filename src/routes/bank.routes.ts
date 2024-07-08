import { FastifyInstance, RouteOptions } from 'fastify';
import { GetBankAccounts } from '@/modules/bank/bank.accounts.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/bank';
/**
 * Defines the Bank routes for the Fastify instance.
 *
 * @param {FastifyInstance} fastify - The Fastify instance.
 * @param {RouteOptions} _opts - The route options.
 */
export default async function Bank(fastify: FastifyInstance, _opts: RouteOptions) {
  // Define a route for getting bank accounts
  /**
   * Get bank accounts.
   *
   * @param {FastifyRequest} request - The request object.
   * @param {FastifyReply} reply - The reply object.
   * @returns {Promise<void>} - A promise that resolves when the accounts are retrieved.
   */
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/accounts`,
    handler: GetBankAccounts,
    // Apply the authentication pre-handler to this route
    preHandler: [fastify.authPrehandler],
  });
}
