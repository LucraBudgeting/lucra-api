export interface PlaidWebhookBody {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
}

export interface SyncUpdatesAvailableBody extends PlaidWebhookBody {
  initial_update_complete: boolean;
  historical_update_complete: boolean;
}
