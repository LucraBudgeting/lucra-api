export interface ICategoryRequest extends ICategory {
  id: string;
}

export interface ICategoryResponse extends ICategory {
  id: string;
}

export interface ICategory {
  avatar: {
    backgroundColor: string | null;
    emoji: string;
  };
  label: string;
  amount: number;
  budgetType: budgetCategoryType;
}

export const transferCategory = 'transfer';

export type budgetCategoryType = 'debit' | 'credit' | 'transfer';
