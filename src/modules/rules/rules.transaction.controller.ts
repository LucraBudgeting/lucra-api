import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionRuleService } from './services/rules.transaction.service';
import { IPutRuleRequest } from './types/rule';
import { ITransactionRuleCondition } from './types/transaction.rules';

export async function GetTransactionRules(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const transactionRuleService = new TransactionRuleService(user.id);
  const rules = await transactionRuleService.getRules();

  return reply.send({ message: 'Rules Fetched', rules });
}

export async function CreateTransactionRule(
  req: FastifyRequest<{ Body: IPutRuleRequest<ITransactionRuleCondition> }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const transactionRuleService = new TransactionRuleService(user.id);
  const rule = await transactionRuleService.createNewRule(req.body);

  return reply.send({ message: 'Rule Created', rule });
}
