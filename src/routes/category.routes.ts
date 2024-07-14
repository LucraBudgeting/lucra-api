import { FastifyInstance, RouteOptions } from 'fastify';
import { HttpMethods } from '@/utils/HttpMethods';
import {
  CreateCategory,
  GetCategories,
  UpdateCategory,
} from '@/modules/budget/category.controller';

const basePath = '/category';

export default async function Category(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.GET,
    url: `${basePath}`,
    handler: GetCategories,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.PUT,
    url: `${basePath}`,
    handler: UpdateCategory,
    preHandler: [fastify.authPrehandler],
  });

  fastify.route({
    method: HttpMethods.POST,
    url: `${basePath}`,
    handler: CreateCategory,
    preHandler: [fastify.authPrehandler],
  });
}
