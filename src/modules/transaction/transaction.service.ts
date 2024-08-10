import { AccountAccess } from '@prisma/client';
import { transactionRepository } from '@/data/repositories/transaction.repository';
import { NotFoundError } from '@/exceptions/error';
import { accountRepository } from '@/data/repositories/account.repository';
import { syncPlaidTransactionQueue } from '@/libs/queue';
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

  async triggerLatestSync(): Promise<void> {
    const accountsBeforeToday = await accountRepository.getAccountsThatHaveLastSyncedBeforeToday(
      this.userId
    );

    if (accountsBeforeToday.accounts.length == 0) {
      return;
    }

    for (let i = 0; i < accountsBeforeToday.access.length; i++) {
      const { id, providerItemId } = accountsBeforeToday.access[i] as AccountAccess;

      const accounts = accountsBeforeToday.accounts.filter(
        (account) => account.accessAccountId === id
      );

      if (accounts.length === 0) {
        continue;
      }

      const accountIds: Record<string, string> = {};

      accounts.forEach((account) => {
        accountIds[account.providerAccountId] = account.id;
      });

      await syncPlaidTransactionQueue(this.userId, accountIds, providerItemId);
    }
  }
}
