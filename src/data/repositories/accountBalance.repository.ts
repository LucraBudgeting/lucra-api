import { AccountBalance } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class AccountBalanceRepository extends BaseRepository {
  async createPlaidAccountBalance(balance: AccountBalance) {
    if (balance.accountId.isNullOrEmpty()) {
      throw new ValidationError('Account ID is required to create plaid account balance');
    }

    return this.client.accountBalance.create({
      data: balance,
    });
  }

  async createPlaidAccountBalanceMany(balances: AccountBalance[]) {
    if (balances.length === 0) {
      return;
    }

    return this.client.accountBalance.createMany({
      data: balances,
    });
  }
}

export const accountBalanceRepository = new AccountBalanceRepository();
