import { Account, AccountAccess } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { logger } from '@/libs/logger';
import { BaseRepository } from './base.repository';
import { accountAccessRepository } from './accountAccess.repository';

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
        lastSyncDate: new Date(),
      },
    });
  }

  async updateLastSyncDate(accountIds: string[]): Promise<void> {
    await this.client.account.updateMany({
      where: {
        id: {
          in: accountIds,
        },
      },
      data: {
        lastSyncDate: new Date(),
      },
    });
  }

  async getAccountsThatHaveLastSyncedBeforeToday(
    userId: string
  ): Promise<{ accounts: Account[]; access: AccountAccess[] }> {
    const accountAccess = await accountAccessRepository.getAccountAccessByUserId(userId);
    const accounts = await this.client.account.findMany({
      where: {
        accessAccountId: {
          in: accountAccess.map((acc) => acc.id),
        },
        OR: [
          {
            lastSyncDate: {
              lt: new Date().toISOString(),
            },
          },
          {
            lastSyncDate: null,
          },
        ],
      },
    });

    return { accounts, access: accountAccess };
  }

  async getLatestCursorFromAccountItemId(
    itemId: string
  ): Promise<{ cursor: string | undefined; accessToken: string }> {
    if (!itemId) {
      logger.error('Account access id is required to get latest cursor');
      throw new ValidationError('Account access id is required to get latest cursor');
    }

    const accountAccess = await this.client.accountAccess.findFirst({
      where: {
        providerItemId: itemId,
      },
      include: {
        account: true,
      },
    });

    if (!accountAccess || !accountAccess?.accessToken) {
      logger.error('No cursors found for account item id', { itemId, accountAccess });
      throw new ValidationError('No cursors found for account item id');
    }

    const cursors = new Map<string, Account>();

    accountAccess.account.forEach((acc) => {
      if (!acc.latestTransactionSyncCursor) {
        return;
      }

      cursors.set(acc.latestTransactionSyncCursor, acc);
    });

    const cursorList = Array.from(cursors.keys());

    if (cursorList.length > 1) {
      logger.error('Multiple cursors found for account access id', {
        itemId,
        cursorList,
        cursors,
        accountAccess,
      });
      throw new ValidationError('Multiple cursors found for account access id');
    }

    return {
      cursor: cursorList[0] ?? undefined,
      accessToken: accountAccess?.accessToken,
    };
  }

  async createAccountMany(accounts: Account[]): Promise<Record<string, string>> {
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
