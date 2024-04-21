import { dbClient } from "@/data/db.client";
import { FastifyInstance, RouteOptions } from "fastify";

export default async function Health(
  fastify: FastifyInstance,
  opts: RouteOptions
) {
  fastify.route({
    method: "GET",
    url: "/health",
    handler: async (request, reply) => {
      await dbClient.$queryRaw`SELECT 1`;
      return { status: "ok" };
    },
  });
}
