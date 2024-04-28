import {
  AuthCheck,
  AuthLogin,
} from "@/modules/authentication/authentication.controller";
import { HttpMethods } from "@/utils/HttpMethods";
import { FastifyInstance, RouteOptions } from "fastify";

const basePath = "/auth";

export default async function Authentication(
  fastify: FastifyInstance,
  opts: RouteOptions
) {
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
