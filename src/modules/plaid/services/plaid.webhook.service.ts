import { plaidAccountAccessRepository } from '@/data/repositories/plaidAccountAccess.repository';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { SyncUpdatesAvailableBody } from '@/types/plaid/plaid.webhook';

export async function HandleSyncUpdatesAvailable(payload: SyncUpdatesAvailableBody) {
  const access = await plaidAccountAccessRepository.getAccountAccessByItemId(payload.item_id);

  const accountIds: Record<string, string> = {};

  access.plaidAccount.forEach((acc) => {
    accountIds[acc.accountId] = acc.id;
  });

  await plaidRepository.syncTransactionHistory(payload.item_id, accountIds, access.accessToken);
}
