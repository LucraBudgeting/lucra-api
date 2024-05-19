import {
  CreateAccount,
  DoesEmailAlreadyExist,
  GetUser,
} from '@/modules/onboarding/onboarding.controller';
import { HttpMethods } from '@/utils/HttpMethods';
import { FastifyInstance, RouteOptions } from 'fastify';

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
    url: `${basePath}/get_user/:userId`,
    handler: GetUser,
  });
}
