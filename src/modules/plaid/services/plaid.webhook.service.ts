import { plaidAccountAccessRepository } from '@/data/repositories/plaidAccountAccess.repository';
import { logger } from '@/libs/logger';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { SyncUpdatesAvailableBody } from '@/types/plaid/plaid.webhook';

export async function HandleSyncUpdatesAvailable(payload: SyncUpdatesAvailableBody) {
  const access = await plaidAccountAccessRepository.getAccountAccessByItemId(payload.item_id);

  const accountIds: Record<string, string> = {};

  access.plaidAccount.forEach((acc) => {
    accountIds[acc.accountId] = acc.id;
  });

  if (access.plaidAccount.length) {
    const nextCursor = access.plaidAccount[0]?.latestTransactionSyncCursor ?? undefined;

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
