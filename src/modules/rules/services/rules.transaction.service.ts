import { ITransactionDto } from '@/modules/transaction/types/transaction';
import { ValidationError } from '@/exceptions/error';
import {
  TransactionCondition,
  TransactionConditionGroup,
  TransactionRule,
} from '../types/transaction.rules';
import { conditionOperator, conditionType } from '../types/condition';

export function applyRulesToTransaction(
  transaction: ITransactionDto,
  rule: TransactionRule
): ITransactionDto {
  let isValidCondition = true;
  for (const condition of rule.conditions) {
    if (!evaluateConditionGroup(transaction, condition)) {
      isValidCondition = false;
      continue;
    }
  }

  if (isValidCondition) {
    return { ...transaction, categoryId: rule.categoryId };
  }

  return transaction;
}

function evaluateConditionGroup(
  transaction: ITransactionDto,
  group: TransactionConditionGroup
): boolean {
  if (group.type === conditionType.and) {
    return group.conditions.every((condition) =>
      typeof condition === 'object' && 'type' in condition
        ? evaluateConditionGroup(transaction, condition as TransactionConditionGroup)
        : evaluateCondition(transaction, condition as TransactionCondition)
    );
  } else if (group.type === conditionType.or) {
    return group.conditions.some((condition) =>
      typeof condition === 'object' && 'type' in condition
        ? evaluateConditionGroup(transaction, condition as TransactionConditionGroup)
        : evaluateCondition(transaction, condition as TransactionCondition)
    );
  } else {
    throw new ValidationError('Invalid condition group type');
  }
}

function evaluateCondition(transaction: ITransactionDto, condition: TransactionCondition): boolean {
  const { field, operator, value } = condition;
  let fieldValue = transaction[field];

  if (typeof fieldValue === 'string') {
    if (!fieldValue) {
      return false;
    }

    fieldValue = fieldValue.toString().toLowerCase();
    const valueLower = value?.toLowerCase();

    switch (operator) {
      case conditionOperator.contains:
        return fieldValue.includes(valueLower);
      case conditionOperator.equals:
        return fieldValue === valueLower;
      case conditionOperator.starts_with:
        return fieldValue.startsWith(valueLower);
      case conditionOperator.ends_with:
        return fieldValue.endsWith(valueLower);
      default:
        return false;
    }
  }

  return false;
}
