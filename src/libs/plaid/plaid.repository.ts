import {
  AccountsGetResponse,
  Configuration,
  CountryCode,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  TransactionsGetRequest,
  TransactionsGetResponse,
  TransactionsSyncRequest,
  TransactionsSyncResponse,
} from 'plaid';
import { User, UserPreferences } from '@prisma/client';
import { PLAID_CLIENT_ID, PLAID_SECRET } from '@/config';
import { ServiceUnavailableError } from '@/exceptions/error';

function getPlaidEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    return PlaidEnvironments.production;
  } else if (process.env.NODE_ENV === 'development') {
    return PlaidEnvironments.development;
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
        optional_products: [Products.Investments],
        // TODO - https://plaid.com/docs/api/tokens/#link-token-create-request-webhook
        country_codes: [CountryCode.Us],
        language: preferences?.language ?? 'en',
        update: {
          account_selection_enabled: true,
        },
        transactions: {
          days_requested: daysRequestedDefault,
        },
      };

      const response = await this.plaidClient.linkTokenCreate(request);

      const linkToken = response.data.link_token;
      return linkToken;
    } catch (error) {
      throw new ServiceUnavailableError(error as string);
    }
  }

  public async exchangePublicToken(publicToken: string): Promise<ItemPublicTokenExchangeResponse> {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data;
    return accessToken;
  }

  public async syncTransaction(
    accessToken: string,
    cursor?: string
  ): Promise<TransactionsSyncResponse> {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor,
      options: {
        include_original_description: true,
        days_requested: daysRequestedDefault,
      },
    };

    console.log('Request: ', request);

    const response = await this.plaidClient.transactionsSync(request);

    return response.data;
  }

  public async getHistoricalTransactions(accessToken: string): Promise<TransactionsGetResponse> {
    const request: TransactionsGetRequest = {
      access_token: accessToken,
      options: {
        include_original_description: true,
      },
      start_date: getDateTwoYearsAgo(),
      end_date: getTodaysDate(),
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
