import { TransactionDto } from '@/modules/transaction/types/transaction';
import { ICondition, IConditionGroup } from './condition';
import { IRule } from './rule';

export interface ITransactionRuleCondition {
  conditionGroup: ITransactionConditionGroup[];
  categoryId: string;
}

export interface ITransactionConditionGroup extends IConditionGroup {
  conditions: (ITransactionCondition | ITransactionConditionGroup)[];
}

export interface ITransactionCondition extends ICondition {
  field: keyof TransactionDto;
}

export interface ITransactionRule extends IRule {
  parsedCondition: ITransactionRuleCondition;
}
