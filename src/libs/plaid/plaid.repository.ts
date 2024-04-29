import {
  AccountsGetResponse,
  Configuration,
  CountryCode,
  LinkTokenCreateRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  TransactionsSyncRequest,
  TransactionsSyncResponse,
} from 'plaid';
import { User, UserPreferences } from '@prisma/client';
import { PLAID_CLIENT_ID, PLAID_SECRET } from '@/config';

function getPlaidEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    return PlaidEnvironments.production;
  }
  return PlaidEnvironments.sandbox;
}

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

class PlaidRepository {
  private plaidClient: PlaidApi;

  constructor() {
    this.plaidClient = new PlaidApi(config);
  }

  public async createLinkToken(user: User, preferences: UserPreferences | null) {
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
        days_requested: 365 * 2, // 2 years
      },
    };

    const response = await this.plaidClient.linkTokenCreate(request);

    const linkToken = response.data.link_token;
    return linkToken;
  }

  public async exchangePublicToken(publicToken: string) {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    return accessToken;
  }

  public async syncTransaction(
    accessToken: string,
    cursor?: string
  ): Promise<TransactionsSyncResponse> {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor,
    };

    const response = await this.plaidClient.transactionsSync(request);

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
