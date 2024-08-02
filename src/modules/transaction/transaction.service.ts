import { transactionRepository } from '@/data/repositories/transaction.repository';
import { ITransactionResponse } from './types/transaction';

export class TransactionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getTransactions(): Promise<ITransactionResponse[]> {
    let transactions = await transactionRepository.getUserTransactions(this.userId);

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
