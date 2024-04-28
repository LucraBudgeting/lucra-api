import { Forbidden } from "@/exceptions/error";
import { User } from "@prisma/client";
import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (fastify: FastifyInstance, _: unknown) => {
  const authPrehandler = async (request: FastifyRequest) => {
    try {
      if (!request.headers?.authorization?.includes("Bearer")) {
        throw new Forbidden("No Authorization Header");
      }

      const user = (await request.jwtVerify()) as {
        user: User;
      };

      request.user = user;
    } catch (error) {
      console.error("authPrehandler Error: ", JSON.stringify(error, null, 4));
      console.error(
        "authPrehandler Error Auth Header: ",
        request.headers?.authorization
      );

      throw new Forbidden("Invalid Token");
    }
  };

  fastify.decorate("authPrehandler", authPrehandler);
});
