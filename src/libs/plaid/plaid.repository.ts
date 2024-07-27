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
import { PlaidTransaction, User, UserPreferences } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { API_URL, NODE_ENV, PLAID_CLIENT_ID, PLAID_SECRET } from '@/config';
import { ServiceUnavailableError } from '@/exceptions/error';
import { getBankImageUrl } from '@/utils/bankNameLogoMapper';
import { plaidTransactionRepository } from '@/data/repositories/plaidTransaction.repository';
import { MapPlaidIsoCode } from '@/modules/plaid/mappers/IsoCurrencyCode.mapper';
import { MapPaymentChannel } from '@/modules/plaid/mappers/PaymentChannel.mapper';
import { TransactionDto } from '@/modules/transaction/types/transaction';
import { transactionRepository } from '@/data/repositories/transaction.repository';
import { logger } from '../logger';
import { webHookBase } from '@/routes/_route.constants';

function getPlaidEnvironment() {
  if (NODE_ENV === 'production' || NODE_ENV === 'development') {
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

  public async createLinkToken(user: User, preferences: UserPreferences | null) {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: user.id,
          phone_number: user?.phoneNumber ?? 'Unknown_Phone_Number',
          email_address: user?.email ?? 'Unknown_Email',
        },
        client_name: clientName,
        products: [Products.Transactions],
        // optional_products: [Products.Investments],
        // TODO - https://plaid.com/docs/api/tokens/#link-token-create-request-webhook
        country_codes: [CountryCode.Us],
        language: preferences?.language ?? 'en',
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
        webhook: `${API_URL}/api/${webHookBase}/plaid/wallet_transaction`,
      };

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

      // Update the flags and cursor
      hasMore = transactionsData.has_more;
      cursor = transactionsData.next_cursor;

      await Promise.all([
        this.syncAddedTransactions(userId, accountIds, transactionsData.added),
        this.syncModifiedTransactions(userId, accountIds, transactionsData.modified),
        this.syncRemovedTransactions(userId, accountIds, transactionsData.removed),
      ]);
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

    // Map the fetched transactions to PlaidTransaction objects
    const plaidTransactions = transactions.map((transaction): PlaidTransaction => {
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
    await this.mapPlaidTransactionsToLucraTransactions(userId, transactions);
  }

  private async mapPlaidTransactionsToLucraTransactions(
    userId: string,
    plaidTransactions: Transaction[]
  ) {
    // Map the fetched transactions to TransactionDto objects
    const lucraTransactions = plaidTransactions.map((transaction): TransactionDto => {
      return new TransactionDto(userId).fromPlaidTransaction(transaction);
    });

    // Create the Lucra transactions in the database
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

    const response = await this.plaidClient.transactionsSync(request);

    return response.data;
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
}

export const plaidRepository = new PlaidRepository();
