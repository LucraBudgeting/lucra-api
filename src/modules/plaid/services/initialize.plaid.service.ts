import { PlaidAccount, PlaidAccountBalance, PlaidTransaction } from '@prisma/client';
import { Record } from '@fastify/type-provider-typebox';
import { Decimal } from '@prisma/client/runtime/library';
import { ItemPublicTokenExchangeResponse, Transaction } from 'plaid';
import { plaidAccountAccessRepository } from '@/data/repositories/plaidAccountAccess.repository';
import { userRepository } from '@/data/repositories/user.repository';
import { userPreferencesRepository } from '@/data/repositories/userPreferences.repository';
import { BadRequestError, ServiceUnavailableError, ValidationError } from '@/exceptions/error';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { plaidAccountRepository } from '@/data/repositories/plaidAccount.repository';
import { plaidAccountBalanceRepository } from '@/data/repositories/plaidAccountBalance.repository';
import { plaidTransactionRepository } from '@/data/repositories/plaidTransaction.repository';
import { bankInstitutionRepository } from '@/data/repositories/bankInstitution.repository';
import { TransactionDto } from '@/modules/transaction/types/transaction';
import { transactionRepository } from '@/data/repositories/transaction.repository';
import { logger } from '@/libs/logger';
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';
import { MapPaymentChannel } from '../mappers/PaymentChannel.mapper';

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
    const plaidAccountAccess = await plaidAccountAccessRepository.createPlaidAccountAccess(
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
      await this.getTransactionHistory(accountIds, exchangeData.access_token);
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
      await plaidAccountAccessRepository.doesUserAlreadyHaveInstitution(this.userId, institutionId);

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

    const plaidAccounts = accountDetails.accounts.map((account): PlaidAccount => {
      return {
        bankInstitutionId: newInstitutionId,
        accessAccountId: accountAccessId,
        accountId: account.account_id,
        mask: account.mask,
        type: MapPlaidAccountType(account.type),
        subType: account.subtype,
        institutionId: accountDetails.item.institution_id ?? 'Unknown',
        institutionDisplayName: account.official_name ?? 'Unknown',
        institutionOfficialName: account.official_name ?? 'Unknown',
      } as PlaidAccount;
    });

    const newAccountIds = await plaidAccountRepository.createPlaidAccountMany(plaidAccounts);

    const balances = accountDetails.accounts.map((account): PlaidAccountBalance => {
      return {
        accountId: newAccountIds[account.account_id],
        available: new Decimal(account.balances.available?.toString() ?? '0'),
        current: new Decimal(account.balances.current?.toString() ?? '0'),
        limit: new Decimal(account.balances.limit?.toString() ?? '0'),
        isoCurrency: MapPlaidIsoCode(account.balances.iso_currency_code),
        plaidLastUpdated: new Date(),
      } as PlaidAccountBalance;
    });

    await plaidAccountBalanceRepository.createPlaidAccountBalanceMany(balances);

    logger.warn('newAccountIds', newAccountIds);

    return newAccountIds;
  }

  private async syncTransactionHistory(
    accountIds: Record<string, string>,
    accessToken: string
  ): Promise<void> {
    // Flag indicating whether there are more transactions to fetch
    let hasMore = true;
    // The cursor to use for fetching transactions
    let cursor: string | undefined = undefined;

    // Fetch and process transactions until there are no more to fetch
    while (hasMore) {
      // Fetch the transactions using the access token and cursor
      const transactionsData = await plaidRepository.syncTransaction(accessToken, cursor);

      logger.warn('transactionsData', transactionsData);
      // Update the flags and cursor
      hasMore = transactionsData.has_more;
      cursor = transactionsData.next_cursor;

      // Map the fetched transactions to PlaidTransaction objects
      const plaidTransactions = transactionsData.added.map((transaction): PlaidTransaction => {
        return {
          accountId: accountIds[transaction.account_id],
          amount: new Decimal(transaction.amount.toString()),
          isoCurrencyCode: MapPlaidIsoCode(transaction.iso_currency_code),
          merchantName: transaction.merchant_name,
          name: transaction.name,
          pending: transaction.pending,
          date: new Date(transaction.date),
          paymentChannel: MapPaymentChannel(transaction.payment_channel),
        } as PlaidTransaction;
      });

      // Create the Plaid transactions in the database
      await plaidTransactionRepository.createPlaidTransactionMany(plaidTransactions);

      // Sync the Plaid transactions to Lucra transactions
      await this.mapPlaidTransactionsToLucraTransactions(transactionsData.added);
    }
  }

  private async mapPlaidTransactionsToLucraTransactions(plaidTransactions: Transaction[]) {
    // Map the fetched transactions to TransactionDto objects
    const lucraTransactions = plaidTransactions.map((transaction): TransactionDto => {
      return new TransactionDto(this.userId).fromPlaidTransaction(transaction);
    });

    // Create the Lucra transactions in the database
    await transactionRepository.createTransactionMany(this.userId, lucraTransactions);
  }

  private async getTransactionHistory(accountIds: Record<string, string>, accessToken: string) {
    const transactionsData = await plaidRepository.getHistoricalTransactions(accessToken);

    // Map the fetched transactions to PlaidTransaction objects
    const plaidTransactions = transactionsData.transactions.map((transaction): PlaidTransaction => {
      return {
        accountId: accountIds[transaction.account_id],
        amount: new Decimal(transaction.amount.toString()),
        isoCurrencyCode: MapPlaidIsoCode(transaction.iso_currency_code),
        merchantName: transaction.merchant_name,
        name: transaction.name,
        pending: transaction.pending,
        date: new Date(transaction.date),
        paymentChannel: MapPaymentChannel(transaction.payment_channel),
      } as PlaidTransaction;
    });

    await plaidTransactionRepository.createPlaidTransactionMany(plaidTransactions);

    await this.mapPlaidTransactionsToLucraTransactions(transactionsData.transactions);
  }
}
