import { budgetCategoryRepository } from '@/data/repositories/budgetCategory.repository';
import { mapBudgetTypeToString } from '@/data/enumHelpers/BudgetCategoryType';
import { CategoryRequest, CategoryResponse } from '../types/category';

export class CategoryService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createCategory(newCategory: CategoryRequest): Promise<CategoryResponse> {
    const category = await budgetCategoryRepository.createCategory(this.userId, newCategory);

    return {
      id: category.id,
      backgroundColor: category.color,
      label: category.label,
      emoji: category.emoji,
      amount: parseInt(category.amount.toString(), 10),
      budgetType: mapBudgetTypeToString(category.budgetType),
    };
  }
}
