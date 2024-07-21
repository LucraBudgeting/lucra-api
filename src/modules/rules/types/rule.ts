import { Rule, RuleModels } from '@prisma/client';
import { ITransactionRuleCondition } from './transaction.rules';

export interface IRule extends Rule {}

export interface ITransactionRule extends IRule {
  condition: ITransactionRuleCondition;
}

export interface IPutRule {
  userId: string;
  model: RuleModels;
  conditions: string;
  name: string;
}
