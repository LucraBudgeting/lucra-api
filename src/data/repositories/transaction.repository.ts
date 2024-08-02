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

    const updateTransactions = transactions.map((transaction) => {
      return this.client.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          accountId: transaction.accountId,
          amount: transaction.amount,
          date: transaction.date,
          isoCurrencyCode: transaction.isoCurrencyCode,
          merchantName: transaction.merchantName,
          name: transaction.name,
          pending: transaction.pending,
          paymentChannel: transaction.paymentChannel,
          addressId: transaction.addressId,
          budgetCategoryId: transaction.budgetCategoryId,
          categoryConfidenceLevel: transaction.categoryConfidenceLevel,
          categoryPrimary: transaction.categoryPrimary,
          categoryDetailed: transaction.categoryDetailed,
          dateUpdated: new Date(),
        },
      });
    });

    await this.client.$transaction(updateTransactions);
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
