import { PlaidAccount } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class PlaidAccountRepository extends BaseRepository {
  async createPlaidAccount(account: PlaidAccount): Promise<string> {
    if (account.accessAccountId.isNullOrEmpty()) {
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

  async createPlaidAccountMany(accounts: PlaidAccount[]): Promise<Record<string, string>> {
    if (accounts.length === 0) {
      return {};
    }

    await this.client.plaidAccount.createMany({
      data: accounts,
    });

    const accountIds: Record<string, string> = {};
    await this.client.plaidAccount
      .findMany({
        where: {
          accessAccountId: accounts[0]?.accessAccountId,
        },
        select: {
          id: true,
          accountId: true,
        },
      })
      .then((accs) =>
        accs.map((acc) => {
          accountIds[acc.accountId] = acc.id;
        })
      );

    return accountIds;
  }
}

export const plaidAccountRepository = new PlaidAccountRepository();
