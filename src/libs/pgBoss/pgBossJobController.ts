import { accountRepository } from '@/data/repositories/account.repository';
import { plaidRepository } from '../plaid/plaid.repository';
import { boss } from './pgBossConfig';

boss.work(
  'sync-transaction-history',
  async (job: { data: { userId: string; accountIds: Record<string, string>; itemId: string } }) => {
    const { userId, accountIds, itemId } = job.data;
    const { cursor, accessToken } =
      await accountRepository.getLatestCursorFromAccountItemId(itemId);
    await plaidRepository.syncTransactionHistory(userId, accountIds, accessToken, cursor);
  }
);
