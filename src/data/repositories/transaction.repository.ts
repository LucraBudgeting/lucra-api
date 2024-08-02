import { Transaction } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { TransactionRuleService } from '@/modules/rules/services/rules.transaction.service';
import { BaseRepository } from './base.repository';

class TransactionRepository extends BaseRepository {
  async getUserTransactions(userId: string) {
    const transactions = await this.client.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return transactions;
  }

  async createTransactionMany(userId: string, transactions: Transaction[]) {
    if (transactions.length === 0) {
      return;
    }

    const transactionRuleService = new TransactionRuleService(userId);

    transactions = await transactionRuleService.applyRulesToTransactions(transactions);

    return this.client.transaction.createMany({
      data: transactions,
    });
  }

  async updateTransactionMany(transactions: Transaction[]) {
    if (transactions.length === 0) {
      return;
    }

    const updatedTransactions = transactions.map((transaction) => {
      return this.client.transaction.update({
        where: {
          id: transaction.id,
        },
        data: { ...transaction },
      });
    });

    await this.client.$transaction(updatedTransactions);
  }

  async associateCategoryWithTransaction(transactionId: string, categoryId?: string) {
    if (!transactionId) {
      throw new ValidationError('TransactionId is required');
    }

    await this.client.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        budgetCategoryId: categoryId || null,
      },
    });
  }
}

export const transactionRepository = new TransactionRepository();
