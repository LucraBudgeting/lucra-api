import { ICondition, IConditionGroup } from './condition';
import { IRule } from './rule';

export interface ITransactionRuleCondition {
  conditionGroups: ITransactionConditionGroup[];
  categoryId: string;
}

export interface ITransactionConditionGroup extends IConditionGroup {
  conditions: ITransactionCondition[];
}

export interface ITransactionCondition extends ICondition {
  field: string;
}

export interface ITransactionRule extends IRule {
  parsedCondition: ITransactionRuleCondition;
}
