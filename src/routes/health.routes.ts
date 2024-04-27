import { dbClient } from "@/data/db.client";
import { HttpMethods } from "@/utils/HttpMethods";
import { FastifyInstance, RouteOptions } from "fastify";

export default async function Health(
  fastify: FastifyInstance,
  opts: RouteOptions
) {
  fastify.route({
    method: HttpMethods.GET,
    url: "/health",
    handler: async (request, reply) => {
      await dbClient.$queryRaw`SELECT 1`;
      return { db_status: "ok" };
    },
  });
}
