import { PlaidAccountBalance } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class PlaidAccountBalanceRepository extends BaseRepository {
  async createPlaidAccountBalance(balance: PlaidAccountBalance) {
    if (balance.accountId.isNullOrEmpty()) {
      throw new ValidationError('Account ID is required to create plaid account balance');
    }

    return this.client.plaidAccountBalance.create({
      data: balance,
    });
  }

  async createPlaidAccountBalanceMany(balances: PlaidAccountBalance[]) {
    if (balances.length === 0) {
      return;
    }

    return this.client.plaidAccountBalance.createMany({
      data: balances,
    });
  }
}

export const plaidAccountBalanceRepository = new PlaidAccountBalanceRepository();
