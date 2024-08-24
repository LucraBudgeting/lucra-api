import { FastifyInstance, RouteOptions } from 'fastify';
import { CompleteGuide, GetGuides } from '@/modules/userGuide/userGuide.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/userGuides';

export default async function UserGuides(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}`,
    handler: GetGuides,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}/:id`,
    handler: CompleteGuide,
    preHandler: [fastify.authPrehandler],
  });
}
