import { FastifyInstance, RouteOptions } from 'fastify';
import {
  CreateAccount,
  DoesEmailAlreadyExist,
  FinalizeBilling,
  GetUser,
  SyncAccounts,
} from '@/modules/onboarding/onboarding.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/onboarding';

export default async function Onboarding(fastify: FastifyInstance, _opts: RouteOptions) {
  // Check if account with email already exists
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/does_email_already_exist/:email`,
    handler: DoesEmailAlreadyExist,
  });

  // Create initial stage of account
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/create_account`,
    handler: CreateAccount,
  });

  // Get user
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/user/:userId`,
    handler: GetUser,
  });

  // Sync accounts
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/sync_accounts/:publicToken`,
    handler: SyncAccounts,
    preHandler: [fastify.authPrehandler],
  });

  // Finalize Billing Connected
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}/finalize_billing_connected/:userId`,
    handler: FinalizeBilling,
  });
}
