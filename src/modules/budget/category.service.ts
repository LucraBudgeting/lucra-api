import { budgetCategoryRepository } from '@/data/repositories/budgetCategory.repository';
import { mapBudgetTypeToString } from '@/data/enumHelpers/BudgetCategoryType';
import { ICategoryRequest, ICategoryResponse } from './types/category';

export class CategoryService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createCategory(newCategory: ICategoryRequest): Promise<ICategoryResponse> {
    const category = await budgetCategoryRepository.createCategory(this.userId, newCategory);

    return {
      id: category.id,
      avatar: {
        backgroundColor: category.color,
        emoji: category.emoji,
      },
      label: category.label,
      amount: parseInt(category.amount.toString(), 10),
      budgetType: mapBudgetTypeToString(category.budgetType),
    };
  }

  async getCategories(): Promise<ICategoryResponse[]> {
    const categories = await budgetCategoryRepository.getCategories(this.userId);

    return categories
      .filter((category) => {
        return category.isActive;
      })
      .map((category) => ({
        id: category.id,
        label: category.label,
        avatar: {
          backgroundColor: category.color,
          emoji: category.emoji,
        },
        amount: parseInt(category.amount.toString(), 10),
        budgetType: mapBudgetTypeToString(category.budgetType),
      }));
  }

  async updateCategory(updatedCategory: ICategoryRequest): Promise<ICategoryResponse[]> {
    await budgetCategoryRepository.updateCategory(this.userId, updatedCategory);

    return this.getCategories();
  }
}
