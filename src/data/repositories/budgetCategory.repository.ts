import { BudgetCategory, BudgetCategoryType } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { CategoryRequest } from '@/modules/budget/types/category';
import { mapStringToBudgetType } from '../enumHelpers/BudgetCategoryType';
import { Decimal } from '@prisma/client/runtime/library';

class BudgetCategoryRepository extends BaseRepository {
  async createCategory(userId: string, newCategory: CategoryRequest): Promise<BudgetCategory> {
    console.log('newCategory', newCategory);
    return await this.client.budgetCategory.create({
      data: {
        userId,
        label: newCategory.label,
        emoji: newCategory.emoji,
        color: newCategory.backgroundColor,
        amount: new Decimal(newCategory.amount),
        budgetType: mapStringToBudgetType(newCategory.budgetType),
      },
    });
  }
}

export const budgetCategoryRepository = new BudgetCategoryRepository();
