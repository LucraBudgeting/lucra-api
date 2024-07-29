import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { isStringFalsey } from '@/utils/isStringFalsey';
import { boss } from '@/libs/pgBoss/pgBossConfig';
import { TransactionService } from './transaction.service';

export async function GetTransactions(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const jobId = await boss.send('my-job', { data: 'Hello, World!' }, { startAfter: 3 });
  console.log('Publishing job in 30 seconds', new Date().toISOString(), jobId);

  const transactionService = new TransactionService(user.id);
  const transactions = await transactionService.getTransactions();

  return reply.send({ message: 'Transactions Fetched', transactions });
}

export async function AssociateCategoryToTransaction(
  req: FastifyRequest<{ Params: { id: string; categoryId?: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id } = req.params;
  let { categoryId } = req.params;

  if (isStringFalsey(categoryId)) {
    categoryId = undefined;
  }

  const transactionService = new TransactionService(user.id);
  await transactionService.associateCategoryWithTransaction(id, categoryId);

  return reply.send({ message: 'Category associated with transaction' });
}
