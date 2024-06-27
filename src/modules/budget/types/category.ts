export interface ICategoryRequest extends ICategory {}

export interface ICategoryResponse extends ICategory {
  id: string;
}

interface ICategory {
  backgroundColor: string | null;
  label: string;
  emoji: string;
  amount: number;
  budgetType: 'debit' | 'credit';
}
