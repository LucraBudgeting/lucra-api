import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionService } from './transaction.service';

export async function GetTransactions(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const transactionService = new TransactionService(user.id);
  const transactions = await transactionService.getTransactions();

  return reply.send({ message: 'Transactions Fetched', transactions });
}
