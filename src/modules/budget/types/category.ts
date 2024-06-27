export interface ICategoryRequest extends ICategory {}

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
  budgetType: 'debit' | 'credit';
}
