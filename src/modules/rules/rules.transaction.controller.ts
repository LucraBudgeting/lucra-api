import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionRuleService } from './services/rules.transaction.service';
import { IPutRuleRequest } from './types/rule';
import { ITransactionRuleCondition } from './types/transaction.rules';
import { OverwriteRuleService } from './services/rules.overwrite.service';

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

export async function UpdateTransactionRule(
  req: FastifyRequest<{ Body: IPutRuleRequest<ITransactionRuleCondition> }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const transactionRuleService = new TransactionRuleService(user.id);
  const rule = await transactionRuleService.updateRule(req.body);

  return reply.send({ message: 'Rule Updated', rule });
}

export async function DeleteTransactionRule(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const ruleService = new TransactionRuleService(user.id);
  await ruleService.deleteRule(req.params.id);

  return reply.send({ message: 'Rule Deleted' });
}

export async function OverwriteAutoApplyRule(
  _req: FastifyRequest<{ Body: IPutRuleRequest<ITransactionRuleCondition> }>,
  reply: FastifyReply
) {
  return reply.status(500).send({ message: 'NOT IMPLEMENTED' });
}

export async function ApplyRulesToTransactions(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;

  const overwriteTransactionService = new OverwriteRuleService(user.id);
  await overwriteTransactionService.ApplyRulesToTransactions();

  return reply.send({ message: 'Rules Applied to Transactions' });
}

export async function AddMerchantToRule(
  req: FastifyRequest<{ Params: { merchantId: string; transactionId: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const ruleService = new TransactionRuleService(user.id);
  await ruleService.addMerchantToRule(req.params.transactionId, req.params.merchantId);
  return reply.send({ message: 'Merchant Added to Rule' });
}
