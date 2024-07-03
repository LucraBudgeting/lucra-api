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

    const plaidAccountAccess = await plaidAccountAccessRepository.createPlaidAccountAccess(
      this.userId,
      exchangeData.access_token,
      exchangeData.item_id
    );

    if (plaidAccountAccess?.accessToken.isNullOrEmpty()) {
      throw new ServiceUnavailableError('Plaid account access could not be created');
    }

    const accountIds = await this.syncAccounts(exchangeData.access_token, plaidAccountAccess.id);
    try {
      await this.syncTransactionHistory(accountIds, exchangeData.access_token);
    } catch (error) {
      console.error('Error syncing transaction history', error);
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

    return newAccountIds;
  }

  private async syncTransactionHistory(accountIds: Record<string, string>, accessToken: string) {
    let hasMore = true;
    let cursor: string | undefined = undefined;

    while (hasMore) {
      const transactionsData = await plaidRepository.syncTransaction(accessToken, cursor);
      transactionsData.added = transactionsData.added.filter(
        (transaction) => accountIds[transaction.account_id]
      );

      hasMore = transactionsData.has_more;
      cursor = transactionsData.next_cursor;

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

      const lucraTransactions = transactionsData.added.map((transaction): TransactionDto => {
        return new TransactionDto(this.userId).fromPlaidTransaction(transaction);
      });

      await plaidTransactionRepository.createPlaidTransactionMany(plaidTransactions);
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
