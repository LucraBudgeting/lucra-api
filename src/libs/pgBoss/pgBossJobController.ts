import {
  syncPlaidAccountBalances,
  syncPlaidAccountBalancesJob,
  syncPlaidTransactionHistoryQueue,
  syncPlaidTransactionJob,
  syncPlaidDataJobPayload,
} from '@/libs/queue';
import { boss } from '@/libs/pgBoss';

boss.work(syncPlaidTransactionHistoryQueue, async (job: { data: syncPlaidDataJobPayload }) => {
  await syncPlaidTransactionJob(job.data);
});

boss.work(syncPlaidAccountBalances, async (job: { data: syncPlaidDataJobPayload }) => {
  await syncPlaidAccountBalancesJob(job.data);
});
