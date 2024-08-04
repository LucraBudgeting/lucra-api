import { accountRepository } from '@/data/repositories/account.repository';
import { boss } from '@/libs/pgBoss';
import { logger } from '../logger';
import { plaidRepository } from '../plaid/plaid.repository';

export const syncPlaidTransactionHistoryQueue = 'sync-plaid-transaction-history';

export async function initialSyncPlaidTransactionQueue(
  userId: string,
  accountIds: Record<string, string>,
  itemId: string
) {
  // 10 seconds, 10 minutes, 24 hours
  [10, 60 * 10, 60 * 60 * 24].forEach(async (time) => {
    await syncPlaidTransactionQueue(userId, accountIds, itemId, time);
  });
}

export async function syncPlaidTransactionQueue(
  userId: string,
  accountIds: Record<string, string>,
  itemId: string,
  startAfter: number
) {
  return boss.publish(
    syncPlaidTransactionHistoryQueue,
    {
      userId: userId,
      accountIds,
      itemId: itemId,
    },
    { startAfter }
  );
}

export type syncPlaidTransactionJobPayload = {
  userId: string;
  accountIds: Record<string, string>;
  itemId: string;
};
export async function syncPlaidTransactionJob(payload: syncPlaidTransactionJobPayload) {
  const { userId, accountIds, itemId } = payload;
  const { cursor, accessToken } = await accountRepository.getLatestCursorFromAccountItemId(itemId);
  if (cursor) {
    logger.warn('Syncing Transactions', { cursor, itemId });
  }
  await plaidRepository.syncTransactionHistory(userId, accountIds, accessToken, cursor);
}
