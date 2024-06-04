import { BudgetCategoryType } from '@prisma/client';

export function mapStringToBudgetType(budgetType: 'debit' | 'credit'): BudgetCategoryType {
  switch (budgetType) {
    case 'debit':
      return BudgetCategoryType.Debit;
    case 'credit':
      return BudgetCategoryType.Credit;
  }
}

export function mapBudgetTypeToString(budgetType: BudgetCategoryType): 'debit' | 'credit' {
  switch (budgetType) {
    case BudgetCategoryType.Debit:
      return 'debit';
    case BudgetCategoryType.Credit:
      return 'credit';
  }
}
