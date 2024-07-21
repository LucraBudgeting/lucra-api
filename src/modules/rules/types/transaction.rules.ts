import { TransactionDto } from '@/modules/transaction/types/transaction';
import { ICondition, IConditionGroup } from './condition';

export interface ITransactionRuleCondition {
  conditions: ITransactionConditionGroup[];
  categoryId: string;
}

export interface ITransactionConditionGroup extends IConditionGroup {
  conditions: (ITransactionCondition | ITransactionConditionGroup)[];
}

export interface ITransactionCondition extends ICondition {
  field: keyof TransactionDto;
}
