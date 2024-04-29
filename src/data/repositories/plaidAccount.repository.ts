import { PlaidAccount } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class PlaidAccountRepository extends BaseRepository {
  async createPlaidAccount(account: PlaidAccount): Promise<string> {
    if (account.accessTokenId.isNullOrEmpty()) {
      throw new ValidationError('Access token is required to create plaid account');
    }

    return await this.client.plaidAccount
      .create({
        data: account,
        select: {
          id: true,
        },
      })
      .then((acc) => acc.id);
  }

  async createPlaidAccountMany(accounts: PlaidAccount[]): Promise<string[]> {
    if (accounts.length === 0) {
      return [];
    }

    await this.client.plaidAccount.createMany({
      data: accounts,
    });

    return await this.client.plaidAccount
      .findMany({
        where: {
          accessTokenId: accounts[0]?.accessTokenId,
        },
      })
      .then((accs) => accs.map((acc) => acc.id));
  }
}

export const plaidAccountRepository = new PlaidAccountRepository();
