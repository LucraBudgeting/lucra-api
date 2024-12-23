import { RuleModels } from '@prisma/client';
import { ITransactionDto } from '@/modules/transaction/types/transaction';
import { ValidationError } from '@/exceptions/error';
import { ruleRepository } from '@/data/repositories/rule.repository';
import { TransactionService } from '@/modules/transaction/transaction.service';
import { logger } from '@/libs/logger';
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

  async addMerchantToRule(transactionId: string, categoryId: string) {
    const transactionService = new TransactionService(this.userId);
    const userRules = await this.getRules();
    const transaction = await transactionService.getTransaction(transactionId);

    if (transaction.name === null) {
      logger.info('Merchant name is null');
      return;
    }

    if (this.doesExistingRuleContainMerchantName(transaction.name, userRules)) {
      logger.info('Merchant already exists in rule');
      return;
    }

    const categoryRule = this.getRuleThatContainsCategoryId(categoryId, userRules);

    if (!categoryRule) {
      await this.createNewMerchantRule(categoryId, transaction.name);
    } else {
      await this.updateMerchantRule(categoryRule, transaction.name);
    }
  }
  async updateMerchantRule(existingRule: ITransactionRule, name: string) {
    const normalizedName = name.toLowerCase();

    const updatedRule = {
      ...existingRule,
      rule: {
        ...existingRule.parsedCondition,
      },
    } as IPutRuleRequest<ITransactionRuleCondition>;
    updatedRule.rule.conditionGroups[0]?.conditions.push({
      field: 'name',
      operator: conditionOperator.equals,
      value: normalizedName,
    } as ITransactionCondition);
    await this.updateRule(updatedRule);
  }
  async createNewMerchantRule(categoryId: string, name: string) {
    const normalizedName = name.toLowerCase();

    const newRule = {
      name: 'Merchant Rule',
      rule: {
        categoryId: categoryId,
        conditionGroups: [
          {
            type: conditionType.or,
            conditions: [
              {
                field: 'name',
                operator: conditionOperator.equals,
                value: normalizedName,
              },
            ],
          },
        ],
      },
    } as IPutRuleRequest<ITransactionRuleCondition>;
    await this.createNewRule(newRule);
  }

  getRuleThatContainsCategoryId(
    categoryId: string,
    rules: ITransactionRule[]
  ): ITransactionRule | undefined {
    return rules.find((rule) => rule.parsedCondition.categoryId === categoryId);
  }
  doesExistingRuleContainMerchantName(merchantName: string, rules: ITransactionRule[]): boolean {
    return rules.some((rule) => {
      const { conditionGroups } = rule.parsedCondition;
      return conditionGroups.some((group) =>
        group.conditions.some((condition) => {
          return condition.field === 'merchantName' && condition.value === merchantName;
        })
      );
    });
  }
  async updateRule(
    updatedRule: IPutRuleRequest<ITransactionRuleCondition>
  ): Promise<ITransactionRule> {
    if (!updatedRule.id) {
      throw new ValidationError('Rule ID is required');
    }

    const dbUpdatedRule = await ruleRepository.updateRule(this.userId, updatedRule.id, {
      model: RuleModels.Transaction,
      conditions: JSON.stringify(updatedRule.rule),
      name: updatedRule.name,
    });

    return {
      ...dbUpdatedRule,
      parsedCondition: JSON.parse(dbUpdatedRule.conditions as string),
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

        if (transaction.budgetCategoryId !== null) {
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
  for (const condition of rule.conditionGroups) {
    if (!evaluateConditionGroup(transaction, condition)) {
      isValidCondition = false;
      continue;
    }
  }

  if (isValidCondition) {
    transaction.budgetCategoryId = rule.categoryId;
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
      evaluateCondition(transaction, condition as ITransactionCondition)
    );
  } else if (group.type === conditionType.or) {
    return group.conditions.some((condition) =>
      evaluateCondition(transaction, condition as ITransactionCondition)
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

  if (!value) {
    return false;
  }

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
