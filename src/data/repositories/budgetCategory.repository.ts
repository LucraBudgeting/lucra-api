import { BudgetCategory } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ICategoryRequest } from '@/modules/budget/types/category';
import { mapStringToBudgetType } from '../enumHelpers/BudgetCategoryType';
import { BaseRepository } from './base.repository';

class BudgetCategoryRepository extends BaseRepository {
  async createCategory(userId: string, newCategory: ICategoryRequest): Promise<BudgetCategory> {
    return await this.client.budgetCategory.create({
      data: {
        userId,
        label: newCategory.label,
        emoji: newCategory.avatar.emoji,
        color: newCategory.avatar.backgroundColor,
        amount: new Decimal(newCategory.amount),
        budgetType: mapStringToBudgetType(newCategory.budgetType),
      },
    });
  }

  async getCategories(userId: string) {
    return await this.client.budgetCategory.findMany({
      where: {
        userId,
      },
    });
  }

  async updateCategory(userId: string, updatedCategory: ICategoryRequest) {
    return await this.client.budgetCategory.updateMany({
      where: {
        userId,
        id: updatedCategory.id,
      },
      data: {
        label: updatedCategory.label,
        emoji: updatedCategory.avatar.emoji,
        color: updatedCategory.avatar.backgroundColor,
        amount: new Decimal(updatedCategory.amount),
        budgetType: mapStringToBudgetType(updatedCategory.budgetType),
      },
    });
  }
}

export const budgetCategoryRepository = new BudgetCategoryRepository();
