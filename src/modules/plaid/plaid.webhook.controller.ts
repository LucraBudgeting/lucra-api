import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@/libs/logger';
import { PlaidWebhookBody, SyncUpdatesAvailableBody } from '@/types/plaid/plaid.webhook';
import { HandleSyncUpdatesAvailable } from './services/plaid.webhook.service';

export async function HandleWalletTransactionWehook(
  request: FastifyRequest<{ Body: PlaidWebhookBody }>,
  reply: FastifyReply
) {
  const { webhook_type, webhook_code } = request.body;
  logger.warn('Webhook Received', request.body);

  switch (webhook_type) {
    case 'TRANSACTIONS':
      switch (webhook_code) {
        case 'SYNC_UPDATES_AVAILABLE': {
          await HandleSyncUpdatesAvailable(request.body as SyncUpdatesAvailableBody);
          break;
        }
      }
      break;
    default:
  }
  return reply.send({ message: 'Sync Transactions' });
}
