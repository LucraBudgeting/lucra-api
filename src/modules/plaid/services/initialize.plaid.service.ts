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
import { accountAccessRepository } from '@/data/repositories/accountAccess.repository';
import { accountRepository } from '@/data/repositories/account.repository';
import { accountBalanceRepository } from '@/data/repositories/accountBalance.repository';
import { initialSyncPlaidTransactionQueue, syncPlaidTransactionHistoryQueue } from '@/libs/queue';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';

export class InitializePlaidService {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
  }

  async createLinkToken(): Promise<string> {
    if (this.userId.isNullOrEmpty()) {
      throw new ValidationError('User ID is required to create link token');
    }

    const userPreferences = await userPreferencesRepository.getUserPreferences(this.userId);
    const user = await userRepository.findUserById(this.userId);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const linkToken = await plaidRepository.createLinkToken(user, userPreferences);

    if (!linkToken) {
      throw new ServiceUnavailableError('Link token not created');
    }

    return linkToken;
  }

  async exchangePublicToken(publicToken: string): Promise<ItemPublicTokenExchangeResponse> {
    if (publicToken.isNullOrEmpty()) {
      throw new ValidationError('Public token is required to exchange public token');
    }

    const exchangeData = await plaidRepository.exchangePublicToken(publicToken);

    return exchangeData;
  }

  async syncAccountsAndTransactions(exchangeData: ItemPublicTokenExchangeResponse): Promise<void> {
    if (exchangeData.access_token.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Public token could not be exchanged');
    }

    if (exchangeData.item_id.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Item ID could not be found');
    }

    const accountAccess = await accountAccessRepository.createPlaidAccountAccess(
      this.userId,
      exchangeData.access_token,
      exchangeData.item_id
    );

    if (accountAccess?.accessToken.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Plaid account access could not be created');
    }

    const accountIds = await this.syncAccountsAndBalances(
      exchangeData.access_token,
      accountAccess.id
    );

    await this.syncTransactions(accountIds, exchangeData.item_id);
  }

  private async syncTransactions(
    accountIds: Record<string, string>,
    itemId: string
  ): Promise<void> {
    try {
      await initialSyncPlaidTransactionQueue(this.userId, accountIds, itemId);
    } catch (error) {
      logger.error(`Error creating ${syncPlaidTransactionHistoryQueue} job`, error);
    }
  }

  private async syncAccountsAndBalances(
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

    const newInstitutionId = await this.getInstitutionId(institutionId);

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

    const newAccountIds = await accountRepository.createAccountMany(plaidAccounts);

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

    return newAccountIds;
  }

  private async getInstitutionId(plaidInstitutionId: string): Promise<string | undefined> {
    let newInstitutionId: string | undefined = undefined;

    const existingInstitution =
      await bankInstitutionRepository.getInstitutionById(plaidInstitutionId);

    if (existingInstitution) {
      newInstitutionId = existingInstitution.id;
    } else {
      const institutionDetails = await plaidRepository.getInstitutionDetails(plaidInstitutionId);

      // If institution details are available, create a new bank institution from the details
      if (institutionDetails) {
        const details =
          await bankInstitutionRepository.createBankInstitutionFromPlaid(institutionDetails);
        newInstitutionId = details.id;
      }
    }

    return newInstitutionId;
  }
}
