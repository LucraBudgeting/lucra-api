import { accountAccessRepository } from '@/data/repositories/accountAccess.repository';
import { logger } from '@/libs/logger';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { SyncUpdatesAvailableBody } from '@/types/plaid/plaid.webhook';

export async function HandleSyncUpdatesAvailable(payload: SyncUpdatesAvailableBody) {
  const access = await accountAccessRepository.getAccountAccessByItemId(payload.item_id);

  const accountIds: Record<string, string> = {};

  access.account.forEach((acc) => {
    accountIds[acc.providerAccountId] = acc.id;
  });

  if (access.account.length) {
    const nextCursor = access.account[0]?.latestTransactionSyncCursor ?? undefined;

    logger.warn('Webhool Syncing Transactions', {
      nextCursor,
      accountIds,
      itemId: payload.item_id,
    });

    await plaidRepository.syncTransactionHistory(
      payload.item_id,
      accountIds,
      access.accessToken,
      nextCursor
    );
  }
}
