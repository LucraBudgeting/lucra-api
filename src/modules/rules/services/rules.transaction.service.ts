import { RuleModels } from '@prisma/client';
import { ITransactionDto } from '@/modules/transaction/types/transaction';
import { ValidationError } from '@/exceptions/error';
import { ruleRepository } from '@/data/repositories/rule.repository';
import {
  ITransactionCondition,
  ITransactionConditionGroup,
  ITransactionRule,
  ITransactionRuleCondition,
} from '../types/transaction.rules';
import { conditionOperator, conditionType } from '../types/condition';
import { IPutRuleRequest } from '../types/rule';

export class TransactionRuleService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getRules(): Promise<ITransactionRule[]> {
    const rules = await ruleRepository.getTransactionRules(this.userId);

    return rules.map((rule) => ({
      ...rule,
      parsedCondition: JSON.parse(rule.conditions as string) as ITransactionRuleCondition,
    }));
  }
  async createNewRule(
    ruleCondition: IPutRuleRequest<ITransactionRuleCondition>
  ): Promise<ITransactionRule> {
    // TODO Create flow to check if new rule overlaps with any existing rules
    const rule = await ruleRepository.createRule(this.userId, {
      model: RuleModels.Transaction,
      conditions: JSON.stringify(ruleCondition.rule),
      name: ruleCondition.name,
    });

    return {
      ...rule,
      parsedCondition: JSON.parse(rule.conditions as string),
    };
  }
  async updateRule(
    ruleId: string,
    updatedRule: ITransactionRuleCondition
  ): Promise<ITransactionRule> {
    const dbUpdatedRule = await ruleRepository.updateRule(this.userId, ruleId, {
      model: RuleModels.Transaction,
      conditions: JSON.stringify(updatedRule.conditionGroup),
      name: '',
    });

    return {
      ...dbUpdatedRule,
      parsedCondition: updatedRule,
    };
  }
  async deleteRule(ruleId: string) {
    await ruleRepository.deleteRule(this.userId, ruleId);
  }
  async applyRulesToTransactions(transactions: ITransactionDto[]): Promise<ITransactionDto[]> {
    const rules = await this.getRules();

    if (!rules.length) {
      return transactions;
    }

    return transactions.map((transaction) => {
      let isTransactionUpdated = false;
      for (const rule of rules) {
        if (isTransactionUpdated) {
          break;
        }

        transaction = applyRulesToTransaction(transaction, rule.parsedCondition);

        if (transaction.categoryId !== null) {
          isTransactionUpdated = true;
        }
      }

      return transaction;
    });
  }
}

export function applyRulesToTransaction(
  transaction: ITransactionDto,
  rule: ITransactionRuleCondition
): ITransactionDto {
  let isValidCondition = true;
  for (const condition of rule.conditionGroup) {
    if (!evaluateConditionGroup(transaction, condition)) {
      isValidCondition = false;
      continue;
    }
  }

  if (isValidCondition) {
    transaction.categoryId = rule.categoryId;
    return transaction;
  }

  return transaction;
}

function evaluateConditionGroup(
  transaction: ITransactionDto,
  group: ITransactionConditionGroup
): boolean {
  if (group.type === conditionType.and) {
    return group.conditions.every((condition) =>
      typeof condition === 'object' && 'type' in condition
        ? evaluateConditionGroup(transaction, condition as ITransactionConditionGroup)
        : evaluateCondition(transaction, condition as ITransactionCondition)
    );
  } else if (group.type === conditionType.or) {
    return group.conditions.some((condition) =>
      typeof condition === 'object' && 'type' in condition
        ? evaluateConditionGroup(transaction, condition as ITransactionConditionGroup)
        : evaluateCondition(transaction, condition as ITransactionCondition)
    );
  } else {
    throw new ValidationError('Invalid condition group type: ' + group.type);
  }
}

function evaluateCondition(
  transaction: ITransactionDto,
  condition: ITransactionCondition
): boolean {
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
