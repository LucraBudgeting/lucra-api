import {
  Configuration,
  CountryCode,
  LinkTokenCreateRequest,
  LinkTokenGetRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest,
} from 'plaid';
import { PLAID_CLIENT_ID, PLAID_SECRET } from '@/config';
import { Guid } from '@/utils/Guid';

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

let ACCESS_TOKEN: string | null = null;
let LINK_TOKEN: string | null = null;
let ITEM_ID: string | null = null;
const ACCOUNT_ID = Guid(true);

class QsPlaidRepository {
  private plaidClient: PlaidApi;

  constructor() {
    this.plaidClient = new PlaidApi(config);
  }

  public async createLinkToken(userId?: string) {
    userId = ACCOUNT_ID;
    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: clientName,
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await this.plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;
    LINK_TOKEN = linkToken;
    return linkToken;
  }

  public async getLinkTokenDetails(linkToken: string) {
    const request: LinkTokenGetRequest = {
      link_token: linkToken,
    };

    const response = await this.plaidClient.linkTokenGet(request);

    console.log('Link Token Details: ', response.data);

    return response.data;
  }

  public async exchangePublicToken(publicToken: string): Promise<any> {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    console.log('Exchange Response: ', response.data);

    ACCESS_TOKEN = response.data.access_token;
    ITEM_ID = response.data.item_id;

    await this.getItemDetails(ITEM_ID);
    await this.getAccountBalance(ACCESS_TOKEN);
    await this.getLinkTokenDetails(LINK_TOKEN!);
    const transactions = await this.syncTransactions();

    return transactions;
  }

  public async getItemDetails(_itemId: string) {
    const response = await this.plaidClient.itemGet({
      access_token: ACCESS_TOKEN!,
    });

    console.log('Item Details: ', response.data.item);

    await this.getInstitutionById(response.data.item.institution_id!);

    return response.data.item;
  }

  public async getInstitutionById(institutionId: string) {
    const response = await this.plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });

    console.log('Institution Details: ', response.data.institution);

    return response.data.institution;
  }

  public async syncTransactions() {
    // https://plaid.com/docs/api/products/transactions/#transactionssync
    const response = await this.plaidClient.transactionsSync({
      access_token: ACCESS_TOKEN!,
      options: {
        include_original_description: true,
      },
    });

    return response.data;
  }

  public async getTransactions() {
    // Set cursor to empty to receive all historical updates
    let cursor = '';

    // New transaction updates since "cursor"
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    // Removed transaction ids
    let removed: RemovedTransaction[] = [];
    let hasMore = true;
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const request: TransactionsSyncRequest = {
        access_token: ACCESS_TOKEN!,
        cursor: cursor,
      };
      const response = await this.plaidClient.transactionsSync(request);
      const data = response.data;
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;

      console.log('HasMore', data.has_more, 'Cursor', data.next_cursor);
      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }

    return [...added].sort((a, b) => +(a.date > b.date) - +(a.date < b.date));
  }

  public async getAccountBalance(accessToken: string = ACCESS_TOKEN!) {
    const response = await this.plaidClient.accountsBalanceGet({
      access_token: accessToken!,
    });

    return response.data.accounts;
  }

  public async getRecurringTransactions() {
    const response = await this.plaidClient.transactionsRecurringGet({
      access_token: ACCESS_TOKEN!,
    });

    return response.data;
  }
}

export const qsPlaidRepository = new QsPlaidRepository();
