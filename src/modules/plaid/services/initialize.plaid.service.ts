import { Record } from '@fastify/type-provider-typebox';
import { Decimal } from '@prisma/client/runtime/library';
import { ItemPublicTokenExchangeResponse } from 'plaid';
import { Account, AccountBalance } from '@prisma/client';
import { userRepository } from '@/data/repositories/user.repository';
import { userPreferencesRepository } from '@/data/repositories/userPreferences.repository';
import { BadRequestError, ServiceUnavailableError, ValidationError } from '@/exceptions/error';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { bankInstitutionRepository } from '@/data/repositories/bankInstitution.repository';
import { logger } from '@/libs/logger';
import { boss } from '@/libs/pgBoss/pgBossConfig';
import { accountAccessRepository } from '@/data/repositories/accountAccess.repository';
import { accountRepository } from '@/data/repositories/account.repository';
import { accountBalanceRepository } from '@/data/repositories/accountBalance.repository';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';

export class InitializePlaidService {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
  }

  async createLinkToken(): Promise<string> {
    // Check if the user ID is valid
    if (this.userId.isNullOrEmpty()) {
      throw new ValidationError('User ID is required to create link token');
    }

    // Get user preferences and user data
    const userPreferences = await userPreferencesRepository.getUserPreferences(this.userId);
    const user = await userRepository.findUserById(this.userId);

    // Check if the user exists
    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Create the Link token
    const linkToken = await plaidRepository.createLinkToken(user, userPreferences);

    // Check if the Link token is created
    if (!linkToken) {
      throw new ServiceUnavailableError('Link token not created');
    }

    return linkToken;
  }

  async exchangePublicToken(publicToken: string): Promise<ItemPublicTokenExchangeResponse> {
    // Check if the public token is valid
    if (publicToken.isNullOrEmpty()) {
      throw new ValidationError('Public token is required to exchange public token');
    }

    // Exchange the public token for an access token
    const exchangeData = await plaidRepository.exchangePublicToken(publicToken);

    // Return the access token
    return exchangeData;
  }

  async syncAccountsAndTransactions(exchangeData: ItemPublicTokenExchangeResponse): Promise<void> {
    // Check if the access token and item ID are valid
    if (exchangeData.access_token.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Public token could not be exchanged');
    }

    if (exchangeData.item_id.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Item ID could not be found');
    }

    // Create a Plaid account access
    const plaidAccountAccess = await accountAccessRepository.createPlaidAccountAccess(
      this.userId,
      exchangeData.access_token,
      exchangeData.item_id
    );

    logger.warn('plaidAccountAccess', plaidAccountAccess.id);

    // Check if the Plaid account access is created
    if (plaidAccountAccess?.accessToken.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Plaid account access could not be created');
    }

    // Sync accounts
    const accountIds = await this.syncAccounts(exchangeData.access_token, plaidAccountAccess.id);

    // Sync transactions
    try {
      // 30 seconds, 10 minutes, 24 hours
      [30, 60 * 10, 60 * 60 * 24].forEach(async (time) => {
        await boss.send(
          'sync-transaction-history',
          {
            userId: this.userId,
            accountIds,
            itemId: exchangeData.item_id,
          },
          { startAfter: time }
        );
      });
    } catch (error) {
      logger.error('Error syncing transaction history', error);
    }
  }

  private async syncAccounts(
    accessToken: string,
    accountAccessId: string
  ): Promise<Record<string, string>> {
    const accountDetails = await plaidRepository.getAccounts(accessToken);

    const institutionId = accountDetails.item.institution_id;

    if (!institutionId) {
      throw new ServiceUnavailableError('Institution ID could not be found');
    }

    const doesUserAlreadyHaveInstitution =
      await accountAccessRepository.doesUserAlreadyHaveInstitution(this.userId, institutionId);

    if (doesUserAlreadyHaveInstitution) {
      throw new BadRequestError('User already has institution');
    }

    const institutionDetails = await plaidRepository.getInstitutionDetails(
      accountDetails.item.institution_id
    );

    let newInstitutionId: string | undefined = undefined;

    // If institution details are available, create a new bank institution from the details
    if (institutionDetails) {
      const details =
        await bankInstitutionRepository.createBankInstitutionFromPlaid(institutionDetails);
      newInstitutionId = details.id;
    }

    const plaidAccounts = accountDetails.accounts.map((account): Account => {
      return {
        bankInstitutionId: newInstitutionId ?? 'Unknown',
        accessAccountId: accountAccessId,
        providerAccountId: account.account_id,
        mask: account.mask,
        type: MapPlaidAccountType(account.type),
        subType: account.subtype,
        institutionId: accountDetails.item.institution_id ?? 'Unknown',
        institutionDisplayName: account.official_name ?? 'Unknown',
        institutionOfficialName: account.official_name ?? 'Unknown',
      } as Account;
    });

    const newAccountIds = await accountRepository.createPlaidAccountMany(plaidAccounts);

    const balances = accountDetails.accounts.map((account): AccountBalance => {
      return {
        accountId: newAccountIds[account.account_id],
        available: new Decimal(account.balances.available?.toString() ?? '0'),
        current: new Decimal(account.balances.current?.toString() ?? '0'),
        limit: new Decimal(account.balances.limit?.toString() ?? '0'),
        isoCurrency: MapPlaidIsoCode(account.balances.iso_currency_code),
        lastUpdated: new Date(),
      } as AccountBalance;
    });

    await accountBalanceRepository.createPlaidAccountBalanceMany(balances);

    logger.warn('newAccountIds and balances', { accountIds: newAccountIds, balances });

    return newAccountIds;
  }
}
