import { FastifyInstance, RouteOptions } from 'fastify';
import { AuthCheck, AuthLogin } from '@/modules/authentication/authentication.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/auth';

export default async function Authentication(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/login`,
    handler: AuthLogin,
  });

  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}`,
    handler: AuthCheck,
    preHandler: [fastify.authPrehandler],
  });
}
