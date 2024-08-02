import { transactionRepository } from '@/data/repositories/transaction.repository';
import { ITransactionResponse } from './types/transaction';

export class TransactionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getTransactions(start?: string, end?: string): Promise<ITransactionResponse[]> {
    let startDate = start ? new Date(start) : new Date();
    let endDate = end ? new Date(end) : new Date();

    if (!start) {
      startDate = new Date();
    }
    if (!end) {
      endDate = new Date();
    }

    let transactions = await transactionRepository.getUserTransactions(
      this.userId,
      startDate,
      endDate
    );

    transactions = transactions.map((transaction) => ({
      ...transaction,
      categoryId: transaction.budgetCategoryId,
    }));
    return transactions;
  }

  async associateCategoryWithTransaction(
    transactionId: string,
    categoryId?: string
  ): Promise<void> {
    await transactionRepository.associateCategoryWithTransaction(transactionId, categoryId);
  }
}
