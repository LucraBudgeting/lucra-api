import { PlaidAccount, PlaidAccountBalance, PlaidTransaction } from '@prisma/client';
import { Record } from '@fastify/type-provider-typebox';
import { Decimal } from '@prisma/client/runtime/library';
import { ItemPublicTokenExchangeResponse } from 'plaid';
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
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';
import { MapPaymentChannel } from '../mappers/PaymentChannel.mapper';

export class InitializePlaidService {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Creates a Plaid Link token for a user.
   *
   * @returns {Promise<string>} The Plaid Link token.
   * @throws {ValidationError} If the user ID is null or empty.
   * @throws {BadRequestError} If the user is not found.
   * @throws {ServiceUnavailableError} If the Link token is not created.
   */
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
  /**
   * Exchanges a public token for an access token.
   *
   * @param {string} publicToken - The public token to exchange.
   * @returns {Promise<ItemPublicTokenExchangeResponse>} The response containing the access token.
   * @throws {ValidationError} If the public token is null or empty.
   */
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

  /**
   * Syncs accounts and transactions for a user.
   *
   * @param {ItemPublicTokenExchangeResponse} exchangeData - The response containing the access token and item ID.
   * @returns {Promise<void>} - A promise that resolves when the accounts and transactions are synced.
   * @throws {ServiceUnavailableError} - If the public token could not be exchanged or the item ID could not be found.
   * @throws {ServiceUnavailableError} - If the Plaid account access could not be created.
   */
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

    // Check if the Plaid account access is created
    if (plaidAccountAccess?.accessToken.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Plaid account access could not be created');
    }

    // Sync accounts
    const accountIds = await this.syncAccounts(exchangeData.access_token, plaidAccountAccess.id);

    // Sync transactions
    try {
      await this.syncTransactionHistory(accountIds, exchangeData.access_token);
    } catch (error) {
      console.error('Error syncing transaction history', error);
    }
  }

  /**
   * Syncs the accounts for a user using the provided access token and account access ID.
   *
   * @param {string} accessToken - The access token for the user's account.
   * @param {string} accountAccessId - The ID of the account access.
   * @returns {Promise<Record<string, string>>} - A promise that resolves to a record of new account IDs.
   * @throws {ServiceUnavailableError} - If the institution ID could not be found.
   * @throws {BadRequestError} - If the user already has the institution.
   */
  private async syncAccounts(
    accessToken: string,
    accountAccessId: string
  ): Promise<Record<string, string>> {
    // Retrieve the account details for the user's account
    const accountDetails = await plaidRepository.getAccounts(accessToken);

    // Extract the institution ID from the account details
    const institutionId = accountDetails.item.institution_id;

    // Check if the institution ID is valid
    if (!institutionId) {
      throw new ServiceUnavailableError('Institution ID could not be found');
    }

    // Check if the user already has the institution
    const doesUserAlreadyHaveInstitution =
      await plaidAccountAccessRepository.doesUserAlreadyHaveInstitution(this.userId, institutionId);

    if (doesUserAlreadyHaveInstitution) {
      throw new BadRequestError('User already has institution');
    }

    // Retrieve the institution details for the institution ID
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

    // Map the account details to PlaidAccount objects
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

    // Create the Plaid accounts in the database
    const newAccountIds = await plaidAccountRepository.createPlaidAccountMany(plaidAccounts);

    // Map the account details to PlaidAccountBalance objects
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

    // Create the Plaid account balances in the database
    await plaidAccountBalanceRepository.createPlaidAccountBalanceMany(balances);

    return newAccountIds;
  }

  /**
   * Synchronizes the transaction history for the given account IDs and access token.
   *
   * @param {Record<string, string>} accountIds - A mapping of account IDs to their corresponding IDs.
   * @param {string} accessToken - The access token for the Plaid account.
   * @returns {Promise<void>} - A promise that resolves when the transaction history is synchronized.
   */
  private async syncTransactionHistory(accountIds: Record<string, string>, accessToken: string) {
    // Flag indicating whether there are more transactions to fetch
    let hasMore = true;
    // The cursor to use for fetching transactions
    let cursor: string | undefined = undefined;

    // Fetch and process transactions until there are no more to fetch
    while (hasMore) {
      // Fetch the transactions using the access token and cursor
      const transactionsData = await plaidRepository.syncTransaction(accessToken, cursor);
      // Filter out transactions that are not associated with any account ID
      transactionsData.added = transactionsData.added.filter(
        (transaction) => accountIds[transaction.account_id]
      );

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

      // Map the fetched transactions to TransactionDto objects
      const lucraTransactions = transactionsData.added.map((transaction): TransactionDto => {
        return new TransactionDto(this.userId).fromPlaidTransaction(transaction);
      });

      // Create the Plaid transactions in the database
      await plaidTransactionRepository.createPlaidTransactionMany(plaidTransactions);
      // Create the Lucra transactions in the database
      await transactionRepository.createTransactionMany(lucraTransactions);
    }
  }

  private async getTransactionHistory(accountIds: Record<string, string>, accessToken: string) {
    const transactionsData = await plaidRepository.getHistoricalTransactions(accessToken);

    const transactions = transactionsData.transactions.map((transaction): PlaidTransaction => {
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

    await plaidTransactionRepository.createPlaidTransactionMany(transactions);
  }
}
