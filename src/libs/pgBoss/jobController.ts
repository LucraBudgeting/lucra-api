import { plaidRepository } from '../plaid/plaid.repository';
import { boss } from './pgBossConfig';

boss.work('my-job', async (job) => {
  console.log('Processing job:', job.data);
  // Add your job processing logic here
});

boss.work(
  'sync-transaction-history',
  async (job: {
    data: { userId: string; accountIds: Record<string, string>; accessToken: string };
  }) => {
    const { userId, accountIds, accessToken } = job.data;
    await plaidRepository.syncTransactionHistory(userId, accountIds, accessToken);
  }
);
