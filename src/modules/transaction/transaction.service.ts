import { transactionRepository } from '@/data/repositories/transaction.repository';
import { NotFoundError } from '@/exceptions/error';
import { ITransactionPatchDto, ITransactionResponse } from './types/transaction';

export class TransactionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getTransactions(start?: string, end?: string): Promise<ITransactionResponse[]> {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

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

  async getTransaction(transactionId: string): Promise<ITransactionResponse> {
    const transaction = await transactionRepository.getTransaction(transactionId);

    if (transaction === null) {
      throw new NotFoundError(`Transaction not found: ${transactionId}`);
    }

    return {
      ...transaction,
      categoryId: transaction.budgetCategoryId ?? '',
    };
  }

  async associateCategoryWithTransaction(
    transactionId: string,
    categoryId?: string
  ): Promise<void> {
    await transactionRepository.associateCategoryWithTransaction(transactionId, categoryId);
  }

  async patchTransaction(transactionId: string, patch: ITransactionPatchDto): Promise<void> {
    await transactionRepository.patchTransaction(transactionId, patch);
  }
}
