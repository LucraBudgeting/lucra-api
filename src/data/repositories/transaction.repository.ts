import { Transaction } from '@prisma/client';
import { BaseRepository } from './base.repository';

class TransactionRepository extends BaseRepository {
  async getUserTransactions(userId: string) {
    const transactions = await this.client.transaction.findMany({
      where: {
        userId,
      },
    });

    return transactions;
  }

  async createTransactionMany(transactions: Transaction[]) {
    if (transactions.length === 0) {
      return;
    }

    return this.client.transaction.createMany({
      data: transactions,
    });
  }
}

export const transactionRepository = new TransactionRepository();
