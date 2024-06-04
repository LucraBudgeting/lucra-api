export interface CategoryRequest extends ICategory {}

export interface CategoryResponse extends ICategory {
  id: string;
}

interface ICategory {
  backgroundColor: string | null;
  label: string;
  emoji: string;
  amount: number;
  budgetType: 'debit' | 'credit';
}
