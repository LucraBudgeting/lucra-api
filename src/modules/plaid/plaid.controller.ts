import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '@prisma/client';
import { PlaidLinkOnSuccessMetadata } from '@/types/plaid/plaid.link';
import { ConnectAccountsService } from '../bank/services/connectAccounts.service';
import { InitializePlaidService } from './services/initialize.plaid.service';

export async function CreatePlaidLinkToken(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as User;
  const { mode = 'add', itemId } = (request.body as any) || {};
  if (mode === 'update' && !itemId) {
    return reply.status(400).send({ message: 'itemId is required for update mode' });
  }
  const service = new InitializePlaidService(user.id);
  const linkToken = await service.createLinkToken(mode, itemId);
  return reply.send({ message: 'Link Token Created', linkToken });
}

export async function SyncAccounts(
  request: FastifyRequest<{
    Params: { publicToken: string };
    Body: PlaidLinkOnSuccessMetadata;
  }>,
  reply: FastifyReply
) {
  const user = request.user as User;
  await new ConnectAccountsService(user.id).syncAccounts(request.params.publicToken, request.body);

  return reply.send({ message: 'Accounts Synced' });
}

export async function UpdatePlaidLinkToken(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as User;
  const { itemId } = (request.body as any) || {};
  if (!itemId) {
    return reply.status(400).send({ message: 'itemId is required for update mode' });
  }
  const service = new InitializePlaidService(user.id);
  const linkToken = await service.createLinkToken('update', itemId);
  return reply.send({ message: 'Link Token Created (Update Mode)', linkToken });
}
