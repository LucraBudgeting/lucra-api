import { transactionRepository } from '@/data/repositories/transaction.repository';
import { ITransactionResponse } from './types/transaction';

export class TransactionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getTransactions(): Promise<ITransactionResponse[]> {
    const transactions = await transactionRepository.getUserTransactions(this.userId);

    return transactions;
  }

  async associateCategoryWithTransaction(
    transactionId: string,
    categoryId?: string
  ): Promise<void> {
    try {
      await transactionRepository.associateCategoryWithTransaction(transactionId, categoryId);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to associate category with transaction');
    }
  }
}
