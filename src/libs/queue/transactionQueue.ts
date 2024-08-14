import { accountRepository } from '@/data/repositories/account.repository';
import { boss } from '@/libs/pgBoss';
import { logger } from '../logger';
import { plaidRepository } from '../plaid/plaid.repository';

export const syncPlaidTransactionHistoryQueue = 'sync-plaid-transaction-history';
export const syncPlaidAccountBalances = 'sync-plaid-account-balances';

export async function initialSyncPlaidTransactionQueue(
  userId: string,
  accountIds: Record<string, string>,
  itemId: string
) {
  try {
    // 10 seconds, 10 minutes, 24 hours
    const syncTimes = [10, 60 * 10, 60 * 60 * 24];
    for (const time of syncTimes) {
      await syncPlaidTransactionQueue(userId, accountIds, itemId, time);
    }
  } catch (error) {
    logger.error(`${syncPlaidTransactionHistoryQueue}`, { error });
  }
}

export async function syncLatestAccountDetails(
  userId: string,
  accountIds: Record<string, string>, // providerAccountId: accountId
  itemId: string
) {
  await syncPlaidAccountBalancesQueue(userId, accountIds, itemId);
  await syncPlaidTransactionQueue(userId, accountIds, itemId);
}

export async function syncPlaidTransactionQueue(
  userId: string,
  accountIds: Record<string, string>,
  itemId: string,
  startAfter: number = 0
) {
  await boss.send(
    syncPlaidTransactionHistoryQueue,
    {
      userId: userId,
      accountIds,
      itemId: itemId,
    },
    { startAfter }
  );
}

export async function syncPlaidAccountBalancesQueue(
  userId: string,
  accountIds: Record<string, string>,
  itemId: string
) {
  await boss.send(syncPlaidAccountBalances, { userId, itemId, accountIds });
}

export type syncPlaidDataJobPayload = {
  userId: string;
  accountIds: Record<string, string>;
  itemId: string;
};

export async function syncPlaidTransactionJob(payload: syncPlaidDataJobPayload) {
  try {
    const { userId, accountIds, itemId } = payload;
    const { cursor, accessToken } =
      await accountRepository.getLatestCursorFromAccountItemId(itemId);
    if (cursor) {
      logger.warn('Syncing Transactions', { payload });
    }
    await plaidRepository.syncTransactionHistory(userId, accountIds, accessToken, cursor);
    await accountRepository.updateTransactionLastSyncDate(Object.values(accountIds));
  } catch (error) {
    logger.error('Error syncing transactions', { error, payload });
  }
}

export async function syncPlaidAccountBalancesJob(payload: {
  userId: string;
  itemId: string;
  accountIds: Record<string, string>;
}) {
  try {
    const { itemId, accountIds } = payload;
    const accessToken = await accountRepository.getAccessTokenFromItemId(itemId);
    if (accessToken) {
      logger.warn('Syncing Account Details', { payload });
    }
    await plaidRepository.syncAccountsAndBalances(accessToken, accountIds);
    await accountRepository.updateBalanceLastSyncDate(Object.values(accountIds));
  } catch (error) {
    logger.error('Error syncing account balances', { error, payload });
  }
}
