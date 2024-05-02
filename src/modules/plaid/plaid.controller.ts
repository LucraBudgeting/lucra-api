import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '@prisma/client';
import { InitializePlaidService } from './services/initialize.plaid.service';

export async function CreatePlaidLinkToken(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as User;
  const service = new InitializePlaidService(user.id);
  const linkToken = await service.createLinkToken();
  return reply.send({ message: 'Link Token Created', linkToken });
}

export async function SyncAccounts(
  request: FastifyRequest<{ Params: { publicToken: string } }>,
  reply: FastifyReply
) {
  const user = request.user as User;
  const service = new InitializePlaidService(user.id);
  const exchangeData = await service.exchangePublicToken(request.params.publicToken);
  await service.syncAccountsAndTransactions(exchangeData);

  return reply.send({ message: 'Accounts Synced' });
}
