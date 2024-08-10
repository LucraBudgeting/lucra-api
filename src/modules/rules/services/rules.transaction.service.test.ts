import { Decimal } from '@prisma/client/runtime/library';
import { ITransactionDto } from '@/modules/transaction/types/transaction';
import { Transaction } from '@/data/db.client';
import { ITransactionRuleCondition } from '../types/transaction.rules';
import { conditionOperator, conditionType } from '../types/condition';
import { applyRulesToTransaction } from './rules.transaction.service';

const baseTransaction: ITransactionDto = {
  id: 't87as87hd8',
  userId: 'u87as87hd8',
  accountId: 'u87as87hd8',
  amount: new Decimal(100),
  date: new Date(),
  isoCurrencyCode: 'USD',
  merchantName: 'Test Merchant',
  name: 'Test Transaction',
  pending: false,
  paymentChannel: 'Other',
  dateCreated: new Date(),
  dateUpdated: new Date(),
  budgetCategoryId: null,
  addressId: null,
  categoryConfidenceLevel: null,
  categoryDetailed: null,
  categoryPrimary: null,
  isExcludedFromBudget: false,
};

describe('applyRulesToTransaction', () => {
  it('should apply rule and change categoryId when conditions are met', () => {
    const transaction: Transaction = { ...baseTransaction, name: 'Test Transaction' };
    const rule: ITransactionRuleCondition = {
      categoryId: 'new',
      conditionGroups: [
        {
          type: conditionType.and,
          conditions: [{ field: 'name', operator: conditionOperator.contains, value: 'Test' }],
        },
      ],
    };

    const result = applyRulesToTransaction(transaction, rule);
    expect(result.categoryId).toBe(rule.categoryId);
  });

  it('should apply rule and change categoryId when complex conditions are met', () => {
    const transaction: ITransactionDto = { ...baseTransaction, name: 'Test Transaction' };
    const rule: ITransactionRuleCondition = {
      categoryId: 'new',
      conditionGroups: [
        {
          type: conditionType.and,
          conditions: [
            { field: 'name', operator: conditionOperator.contains, value: 'Test' },
            { field: 'merchantName', operator: conditionOperator.starts_with, value: 'test' },
            { field: 'merchantName', operator: conditionOperator.contains, value: 'merchant' },
          ],
        },
        {
          type: conditionType.or,
          conditions: [
            { field: 'amount', operator: conditionOperator.equals, value: new Decimal(90) },
            { field: 'isoCurrencyCode', operator: conditionOperator.equals, value: 'USD' },
            { field: 'merchantName', operator: conditionOperator.starts_with, value: 'merchant' },
          ],
        },
        {
          type: conditionType.and,
          conditions: [
            {
              field: 'merchantName',
              operator: conditionOperator.equals,
              value: transaction.merchantName,
            },
            { field: 'name', operator: conditionOperator.equals, value: transaction.name },
          ],
        },
      ],
    };

    const result = applyRulesToTransaction(transaction, rule);
    expect(result.categoryId).toBe(rule.categoryId);
  });

  it('should not apply rule and change categoryId when condition groups should be AND', () => {
    const transaction: ITransactionDto = { ...baseTransaction, name: 'Test Transaction' };
    const rule: ITransactionRuleCondition = {
      categoryId: 'new',
      conditionGroups: [
        {
          type: conditionType.and,
          conditions: [
            { field: 'name', operator: conditionOperator.contains, value: 'Test' },
            { field: 'merchantName', operator: conditionOperator.starts_with, value: 'test' },
          ],
        },
        {
          type: conditionType.or,
          conditions: [
            { field: 'name', operator: conditionOperator.equals, value: 'invalid name' },
            { field: 'isoCurrencyCode', operator: conditionOperator.equals, value: 'invalid' },
          ],
        },
      ],
    };

    const result = applyRulesToTransaction(transaction, rule);
    expect(result.categoryId).toBe(transaction.categoryId);
  });

  it('should not change categoryId when conditions are not met', () => {
    const transaction: ITransactionDto = { ...baseTransaction, categoryId: 'old' };
    const rule: ITransactionRuleCondition = {
      categoryId: 'new',
      conditionGroups: [
        {
          type: conditionType.and,
          conditions: [{ field: 'name', operator: conditionOperator.contains, value: 'Sample' }],
        },
      ],
    };

    const result = applyRulesToTransaction(transaction, rule);
    expect(result.categoryId).toBe(transaction.categoryId);
  });
});
