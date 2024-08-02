import { Account } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class AccountRepository extends BaseRepository {
  async updateLatestCursors(accountIds: string[], cursor: string): Promise<void> {
    await this.client.account.updateMany({
      where: {
        id: {
          in: accountIds,
        },
      },
      data: {
        latestTransactionSyncCursor: cursor,
      },
    });
  }
  async createPlaidAccount(account: Account): Promise<string> {
    if (account.accessAccountId.isNullOrEmpty()) {
      throw new ValidationError('Access token is required to create plaid account');
    }

    return await this.client.account
      .create({
        data: account,
        select: {
          id: true,
        },
      })
      .then((acc) => acc.id);
  }

  async createPlaidAccountMany(accounts: Account[]): Promise<Record<string, string>> {
    if (accounts.length === 0) {
      return {};
    }

    await this.client.account.createMany({
      data: accounts,
    });

    const accountIds: Record<string, string> = {};
    await this.client.account
      .findMany({
        where: {
          accessAccountId: accounts[0]?.accessAccountId,
        },
        select: {
          id: true,
          providerAccountId: true,
        },
      })
      .then((accs) =>
        accs.forEach((acc) => {
          accountIds[acc.providerAccountId] = acc.id;
        })
      );

    return accountIds;
  }
}

export const accountRepository = new AccountRepository();
