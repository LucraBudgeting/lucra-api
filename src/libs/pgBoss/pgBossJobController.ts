import {
  syncPlaidTransactionHistoryQueue,
  syncPlaidTransactionJob,
  syncPlaidTransactionJobPayload,
} from '@/libs/queue';
import { boss } from '@/libs/pgBoss';

boss.work(
  syncPlaidTransactionHistoryQueue,
  async (job: { data: syncPlaidTransactionJobPayload }) => {
    await syncPlaidTransactionJob(job.data);
  }
);
