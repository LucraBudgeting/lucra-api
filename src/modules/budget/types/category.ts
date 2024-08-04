export interface ICategoryRequest extends ICategory {
  id: string;
}

export interface ICategoryResponse extends ICategory {
  id: string;
}

interface ICategory {
  avatar: {
    backgroundColor: string | null;
    emoji: string;
  };
  label: string;
  amount: number;
  budgetType: budgetCategoryType;
}

export type budgetCategoryType = 'debit' | 'credit' | 'transfer';
