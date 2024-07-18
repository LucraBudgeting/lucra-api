import { TransactionDto } from '@/modules/transaction/types/transaction';
import { Condition, ConditionGroup } from './condition';

export interface TransactionRule {
  conditions: TransactionConditionGroup[];
  categoryId: string;
}

export interface TransactionConditionGroup extends ConditionGroup {
  conditions: (TransactionCondition | TransactionConditionGroup)[];
}

export interface TransactionCondition extends Condition {
  field: keyof TransactionDto;
}
