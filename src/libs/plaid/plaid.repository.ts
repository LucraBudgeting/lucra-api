import {
  AccountsGetResponse,
  Configuration,
  CountryCode,
  CreditAccountSubtype,
  DepositoryAccountSubtype,
  Institution,
  InstitutionsGetByIdRequest,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsGetRequest,
  TransactionsGetResponse,
  TransactionsSyncRequest,
  TransactionsSyncResponse,
} from 'plaid';
import { AccountBalance, User, UserPreferences } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { API_URL, IS_PRODUCTION, PLAID_CLIENT_ID, PLAID_SECRET } from '@/config';
import { ServiceUnavailableError } from '@/exceptions/error';
import { getBankImageUrl } from '@/utils/bankNameLogoMapper';
import { TransactionDto } from '@/modules/transaction/types/transaction';
import { transactionRepository } from '@/data/repositories/transaction.repository';
import { webHookBase } from '@/routes/_route.constants';
import { accountRepository } from '@/data/repositories/account.repository';
import { MapPlaidIsoCode } from '@/modules/plaid/mappers/IsoCurrencyCode.mapper';
import { accountBalanceRepository } from '@/data/repositories/accountBalance.repository';
import { logger } from '../logger';

function getPlaidEnvironment() {
  if (IS_PRODUCTION) {
    return PlaidEnvironments.production;
  }

  return PlaidEnvironments.sandbox;
}

const getDateTwoYearsAgo = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2);
  return date.toISOString().split('T')[0] as string;
};

const getTodaysDate = (): string => {
  return new Date().toISOString().split('T')[0] as string;
};

const config = new Configuration({
  basePath: getPlaidEnvironment(),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const clientName = 'Lucra Budgeting';

const daysRequestedDefault = 365 * 2; // 2 years

class PlaidRepository {
  private plaidClient: PlaidApi;

  constructor() {
    this.plaidClient = new PlaidApi(config);
  }

  public async createLinkToken(
    user: User,
    preferences: UserPreferences | null,
    options?: { mode?: 'add' | 'update'; accessToken?: string }
  ) {
    try {
      const { mode = 'add', accessToken } = options || {};
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: user.id,
          phone_number: user?.phoneNumber ?? 'Unknown_Phone_Number',
          email_address: user?.email ?? 'Unknown_Email',
        },
        client_name: clientName,
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: preferences?.language ?? 'en',
        webhook: `${API_URL}/api/${webHookBase}/plaid/wallet_transaction`,
        update: {
          account_selection_enabled: true,
        },
        transactions: {
          days_requested: daysRequestedDefault,
        },
        account_filters: {
          depository: {
            account_subtypes: [DepositoryAccountSubtype.All],
          },
          credit: {
            account_subtypes: [CreditAccountSubtype.All],
          },
        },
      };
      if (mode === 'update') {
        if (accessToken) {
          // Plaid requires access_token for update mode
          (request as any).access_token = accessToken;
        } else {
          throw new ServiceUnavailableError('accessToken is required for update mode');
        }
      }
      const response = await this.plaidClient.linkTokenCreate(request);
      const linkToken = response.data.link_token;
      return linkToken;
    } catch (error) {
      throw new ServiceUnavailableError(error as string);
    }
  }

  public async getInstitutionDetails(institutionId?: string | null): Promise<Institution | null> {
    if (!institutionId) return null;

    const request: InstitutionsGetByIdRequest = {
      country_codes: [CountryCode.Us],
      institution_id: institutionId,
      options: {
        include_optional_metadata: true,
      },
    };

    const details = await this.plaidClient.institutionsGetById(request);

    if (!details.data.institution.logo) {
      details.data.institution.logo = getBankImageUrl(details.data.institution.name);
    }

    return details.data.institution;
  }

  public async exchangePublicToken(publicToken: string): Promise<ItemPublicTokenExchangeResponse> {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data;
    return accessToken;
  }

  public async syncTransactionHistory(
    userId: string,
    accountIds: Record<string, string>,
    accessToken: string,
    lastCursor?: string
  ): Promise<void> {
    // Flag indicating whether there are more transactions to fetch
    let hasMore = true;
    // The cursor to use for fetching transactions
    let cursor: string | undefined = lastCursor;

    // Fetch and process transactions until there are no more to fetch
    while (hasMore) {
      // Fetch the transactions using the access token and cursor
      const transactionsData = await plaidRepository.syncTransaction(accessToken, cursor);

      // Update the flags and cursor
      hasMore = transactionsData.has_more;
      cursor = transactionsData.next_cursor;

      logger.warn('transactionsData', {
        hasMore,
        cursor,
        addedCount: transactionsData.added.length,
        modifiedCount: transactionsData.modified.length,
        removedCount: transactionsData.removed.length,
      });

      await Promise.all([
        this.syncAddedTransactions(userId, accountIds, transactionsData.added),
        this.syncModifiedTransactions(userId, accountIds, transactionsData.modified),
        this.syncRemovedTransactions(userId, accountIds, transactionsData.removed),
      ]).catch((error) => {
        logger.error('Error syncing transactions', { error });
      });
    }

    if (!hasMore && cursor) {
      logger.info('No more transactions to fetch. Saving last cursor', {
        cursor,
        accountIds: Object.values(accountIds),
      });
      await accountRepository.updateLatestCursors(Object.values(accountIds), cursor);
    }
  }

  //TODO - Implement these methods
  private async syncModifiedTransactions(
    _userId: string,
    _accountIds: Record<string, string>,
    transactions: Transaction[]
  ) {
    logger.warn('transactionsDataModified', transactions.length);
  }

  private async syncRemovedTransactions(
    _userId: string,
    _accountIds: Record<string, string>,
    transactions: RemovedTransaction[]
  ) {
    logger.warn('transactionsDataRemoved', transactions.length);
  }

  private async syncAddedTransactions(
    userId: string,
    accountIds: Record<string, string>,
    transactions: Transaction[]
  ) {
    logger.warn('transactionsDataAdded', transactions.length);

    transactions = transactions.filter(
      (transaction) => transaction.amount !== 0 && transaction.pending === false
    );

    await this.mapPlaidTransactionsToLucraTransactions(userId, accountIds, transactions);
  }

  private async mapPlaidTransactionsToLucraTransactions(
    userId: string,
    accountIds: Record<string, string>,
    plaidTransactions: Transaction[]
  ) {
    const lucraTransactions = plaidTransactions.map((transaction): TransactionDto => {
      return new TransactionDto(userId).fromPlaidTransaction(transaction, accountIds);
    });

    await transactionRepository.createTransactionMany(userId, lucraTransactions);
  }

  public async syncTransaction(
    accessToken: string,
    cursor?: string
  ): Promise<TransactionsSyncResponse> {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor,
      count: 500,
      options: {
        include_original_description: true,
        days_requested: daysRequestedDefault,
      },
    };

    try {
      const response = await this.plaidClient.transactionsSync(request);

      return response.data;
    } catch (error) {
      throw new ServiceUnavailableError(error as string);
    }
  }

  public async getHistoricalTransactions(
    accessToken: string,
    startDate?: string,
    endDate?: string
  ): Promise<TransactionsGetResponse> {
    const request: TransactionsGetRequest = {
      access_token: accessToken,
      options: {
        include_original_description: true,
        count: 500,
      },
      start_date: startDate ? startDate : getDateTwoYearsAgo(),
      end_date: endDate ? endDate : getTodaysDate(),
    };

    const response = await this.plaidClient.transactionsGet(request);

    return response.data;
  }

  public async getAccounts(accessToken: string): Promise<AccountsGetResponse> {
    const response = await this.plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data;
  }

  public async syncAccountsAndBalances(
    accessToken: string,
    accountIds: Record<string, string>
  ): Promise<void> {
    const accounts = await this.getAccounts(accessToken);

    const balances = accounts.accounts.map((account): AccountBalance => {
      return {
        accountId: accountIds[account.account_id],
        available: new Decimal(account.balances.available?.toString() ?? '0'),
        current: new Decimal(account.balances.current?.toString() ?? '0'),
        limit: new Decimal(account.balances.limit?.toString() ?? '0'),
        isoCurrency: MapPlaidIsoCode(account.balances.iso_currency_code),
        lastUpdated: new Date(),
      } as AccountBalance;
    });

    await accountBalanceRepository.createPlaidAccountBalanceMany(balances);
  }

  public async deleteAccountAccess(accessToken: string): Promise<void> {
    try {
      await this.plaidClient.itemRemove({ access_token: accessToken });
    } catch (error) {
      // @ts-expect-error error is not typed
      logger.error('Error deleting account sync:', error?.response?.data || error?.message);
    }
  }
}

export const plaidRepository = new PlaidRepository();
