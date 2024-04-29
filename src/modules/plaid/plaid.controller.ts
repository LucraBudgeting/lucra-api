import { FastifyRequest, FastifyReply } from 'fastify';

export async function CreatePlaidLinkToken(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ message: 'Link Token Created' });
}
