import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionService } from './transaction.service';

export async function GetTransactions(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const transactionService = new TransactionService(user.id);
  const transactions = await transactionService.getTransactions();

  return reply.send({ message: 'Transactions Fetched', transactions });
}

export async function AssociateCategoryToTransaction(
  req: FastifyRequest<{ Params: { id: string; categoryId: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id, categoryId } = req.params;

  const transactionService = new TransactionService(user.id);
  await transactionService.associateCategoryWithTransaction(id, categoryId);

  return reply.send({ message: 'Category associated with transaction' });
}
