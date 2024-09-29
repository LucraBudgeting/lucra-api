import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { isStringFalsey } from '@/utils/isStringFalsey';
import { ValidationError } from '@/exceptions/error';
import { TransactionService } from './transaction.service';

export async function GetTransactions(
  req: FastifyRequest<{
    Querystring: { start?: string; end?: string; accountId?: string };
    user: User;
  }>,
  reply: FastifyReply
) {
  const { start, end, accountId } = req.query;
  const user = req.user as User;

  const transactionService = new TransactionService(user.id);
  const transactions = await transactionService.getTransactions(start, end, accountId);

  return reply.send({ message: 'Transactions Fetched', transactions });
}

export async function GetTransaction(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Transaction ID is required');
  }

  const transactionService = new TransactionService(user.id);
  const transaction = await transactionService.getTransaction(id);

  return reply.send({ message: 'Transaction Fetched', transaction });
}

export async function PatchTransaction(
  req: FastifyRequest<{
    Params: { id: string };
    Body: {
      categoryId: string;
      excludeFromBudget: boolean;
    };
  }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id } = req.params;
  const { categoryId, excludeFromBudget } = req.body;
  const transactionService = new TransactionService(user.id);
  await transactionService.patchTransaction(id, { categoryId, excludeFromBudget });

  return reply.send({ message: 'Transaction updated' });
}

export async function ExcludeTransactionFromBudget(
  req: FastifyRequest<{ Params: { id: string }; Querystring: { excludeFromBudget: boolean } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id } = req.params;
  const { excludeFromBudget } = req.query;
  const transactionService = new TransactionService(user.id);
  await transactionService.excludeTransactionFromBudget(id, excludeFromBudget);

  return reply.send({ message: 'Transaction excluded from budget' });
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
