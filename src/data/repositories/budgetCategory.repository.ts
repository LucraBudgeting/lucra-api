import { BudgetCategory, BudgetCategoryType } from '@prisma/client';
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

  async deleteCategory(userId: string, categoryId: string) {
    return await this.client.budgetCategory.deleteMany({
      where: {
        userId,
        id: categoryId,
      },
    });
  }

  async getOrCreateTransferCategory(userId: string) {
    const transferCategory = await this.client.budgetCategory.findFirst({
      where: {
        userId,
        label: 'Transfer',
      },
    });

    if (transferCategory) {
      return transferCategory;
    }

    return await this.client.budgetCategory.create({
      data: {
        userId,
        label: 'Transfer',
        emoji: '🔀',
        color: '#000000',
        amount: new Decimal(0),
        budgetType: BudgetCategoryType.Transfer,
      },
    });
  }

  async getCategories(userId: string) {
    return await this.client.budgetCategory.findMany({
      where: {
        userId,
      },
      orderBy: {
        dateCreated: 'asc',
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
