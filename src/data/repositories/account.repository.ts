import { Account } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { logger } from '@/libs/logger';
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

  async getLatestCursorFromAccountItemId(
    itemId: string
  ): Promise<{ cursor: string | undefined; accessToken: string }> {
    if (!itemId) {
      logger.error('Account access id is required to get latest cursor');
      throw new ValidationError('Account access id is required to get latest cursor');
    }

    const accountAccess = await this.client.account.findMany({
      where: {
        providerAccountId: itemId,
      },
      distinct: ['latestTransactionSyncCursor'],
      select: {
        latestTransactionSyncCursor: true,
        accessAccountId: true,
      },
    });

    if (!accountAccess || accountAccess.length === 0 || !accountAccess[0]?.accessAccountId) {
      logger.error('No cursors found for account item id', { itemId, accountAccess });
      throw new ValidationError('No cursors found for account item id');
    }

    if (accountAccess.length > 1) {
      logger.error('Multiple cursors found for account access id', itemId);
      throw new ValidationError('Multiple cursors found for account access id');
    }

    return {
      cursor: accountAccess[0]?.latestTransactionSyncCursor ?? undefined,
      accessToken: accountAccess[0]?.accessAccountId,
    };
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
