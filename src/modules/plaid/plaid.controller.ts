import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '@prisma/client';
import {
  createLinkToken,
  exchangePublicToken,
  syncAccountsAndTransactions,
} from './services/initialize.plaid.service';

export async function CreatePlaidLinkToken(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as User;
  const linkToken = await createLinkToken(user.id);
  return reply.send({ message: 'Link Token Created', linkToken });
}

export async function SyncAccounts(
  request: FastifyRequest<{ Params: { publicToken: string } }>,
  reply: FastifyReply
) {
  const user = request.user as User;
  const accessToken = await exchangePublicToken(request.params.publicToken);
  await syncAccountsAndTransactions(user.id, accessToken);

  return reply.send({ message: 'Accounts Synced' });
}
