import { BudgetCategoryType } from '@prisma/client';
import { budgetCategoryType } from '@/modules/budget/types/category';

export function mapStringToBudgetType(budgetType: budgetCategoryType): BudgetCategoryType {
  switch (budgetType) {
    case 'debit':
      return BudgetCategoryType.Debit;
    case 'credit':
      return BudgetCategoryType.Credit;
    case 'transfer':
      return BudgetCategoryType.Transfer;
  }
}

export function mapBudgetTypeToString(budgetType: BudgetCategoryType): budgetCategoryType {
  switch (budgetType) {
    case BudgetCategoryType.Debit:
      return 'debit';
    case BudgetCategoryType.Credit:
      return 'credit';
    case BudgetCategoryType.Transfer:
      return 'transfer';
  }
}
