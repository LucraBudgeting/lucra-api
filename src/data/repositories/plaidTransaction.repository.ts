import { PlaidTransaction } from '@prisma/client';
import { BaseRepository } from './base.repository';

class PlaidTransactionRepository extends BaseRepository {
  async createPlaidTransaction(transaction: PlaidTransaction) {
    return this.client.plaidTransaction.create({
      data: transaction,
    });
  }

  async createPlaidTransactionMany(transactions: PlaidTransaction[]) {
    if (transactions.length === 0) {
      return;
    }

    return this.client.plaidTransaction.createMany({
      data: transactions,
    });
  }

  async getPlaidTransactions(userId: string) {
    return this.client.plaidTransaction.findMany({
      where: {
        account: {
          accessToken: {
            userId: userId,
          },
        },
      },
    });
  }
}

export const plaidTransactionRepository = new PlaidTransactionRepository();
