import { accountAccessRepository } from '@/data/repositories/accountAccess.repository';
import { ValidationError } from '@/exceptions/error';
import { InitializePlaidService } from '@/modules/plaid/services/initialize.plaid.service';
import { PlaidLinkOnSuccessMetadata } from '@/types/plaid/plaid.link';

export class ConnectAccountsService {
  private userId: string;
  private plaidService: InitializePlaidService;

  constructor(userId: string) {
    this.userId = userId;
    this.plaidService = new InitializePlaidService(this.userId);
  }

  async syncAccounts(
    publicToken: string,
    metaData: PlaidLinkOnSuccessMetadata & { update?: boolean }
  ): Promise<void> {
    const exchangeData = await this.plaidService.exchangePublicToken(publicToken);
    if (metaData.update) {
      // Only run transaction sync (syncPlaidTransactionJob)
      await this.plaidService.syncTransactionsOnly(exchangeData);
      return;
    } else {
      await this.plaidService.syncAccountsAndTransactions(exchangeData);
    }
    return;
  }

  private async validateInitialSyncMetaData(metaData: PlaidLinkOnSuccessMetadata): Promise<void> {
    await this.validateUserDoesntAlreadyHavePlaidAccount(metaData);
  }

  private async validateUserDoesntAlreadyHavePlaidAccount(
    metaData: PlaidLinkOnSuccessMetadata
  ): Promise<void> {
    if (!metaData.institution?.institution_id) return;

    const doesUserAlreadyHaveInstitution =
      await accountAccessRepository.doesUserAlreadyHaveInstitution(
        this.userId,
        metaData.institution?.institution_id
      );

    if (doesUserAlreadyHaveInstitution) {
      throw new ValidationError('User already has this institution connected');
    }
  }
}
