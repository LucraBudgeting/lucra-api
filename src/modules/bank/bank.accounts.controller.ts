import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { bankAccountRepository } from '@/data/repositories/bank.repository';

export async function GetBankAccounts(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const bankAccounts = await bankAccountRepository.getBankAccounts(user.id);

  return reply.send({ message: 'Bank accounts', bankAccounts });
}
