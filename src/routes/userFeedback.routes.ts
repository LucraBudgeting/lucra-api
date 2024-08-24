import { FastifyInstance, RouteOptions } from 'fastify';
import { CreateUserFeedback } from '@/modules/userFeedback/userFeedback.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/userFeedback';

export default async function UserFeedback(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}`,
    handler: CreateUserFeedback,
    preHandler: [fastify.authPrehandler],
  });
}
