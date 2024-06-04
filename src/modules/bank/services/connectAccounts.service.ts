import { InitializePlaidService } from '@/modules/plaid/services/initialize.plaid.service';

export class ConnectAccountsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async syncAccounts(publicToken: string): Promise<void> {
    const service = new InitializePlaidService(this.userId);
    const exchangeData = await service.exchangePublicToken(publicToken);
    await service.syncAccountsAndTransactions(exchangeData);
  }
}
