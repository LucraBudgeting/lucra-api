import { ICategory } from './types/category';

export const blueprintCategories = [
  {
    avatar: {
      backgroundColor: '#FFD700',
      emoji: '🍔',
    },
    label: 'Food & Dining',
    amount: 150,
    budgetType: 'debit',
  },
  {
    avatar: {
      backgroundColor: '#FF6347',
      emoji: '🚗',
    },
    label: 'Transportation',
    amount: 100,
    budgetType: 'debit',
  },
  {
    avatar: {
      backgroundColor: '#87CEEB',
      emoji: '🤑',
    },
    label: 'Salary',
    amount: 100,
    budgetType: 'credit',
  },
  {
    avatar: {
      backgroundColor: '#FF69B4',
      emoji: '💸',
    },
    label: 'Investments',
    amount: 100,
    budgetType: 'credit',
  },
] as ICategory[];
