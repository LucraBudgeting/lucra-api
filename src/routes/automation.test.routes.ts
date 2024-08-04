import { FastifyInstance, RouteOptions } from 'fastify';
import { DeleteTestUser } from '@/modules/automationTest/automation.test.controller';
import { HttpMethods } from '@/utils/HttpMethods';

const basePath = '/automation/test';

export default async function AutomationTest(fastify: FastifyInstance, _opts: RouteOptions) {
  fastify.route({
    method: HttpMethods.DELETE,
    url: `${basePath}/:userId`,
    handler: DeleteTestUser,
  });
}
