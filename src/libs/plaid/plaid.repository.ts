import { PLAID_CLIENT_ID, PLAID_SECRET } from "@/config";
import { Guid } from "@/utils/Guid";
import {
  Configuration,
  CountryCode,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest,
} from "plaid";

function getPlaidEnvironment() {
  if (process.env.NODE_ENV === "production") {
    return PlaidEnvironments.production;
  }
  return PlaidEnvironments.sandbox;
}

const config = new Configuration({
  basePath: getPlaidEnvironment(),
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
    },
  },
});

const clientName = "Lucra Budgeting";

let ACCESS_TOKEN: string | null = null;
let ITEM_ID: string | null = null;
let ACCOUNT_ID = Guid(true);

class PlaidRepository {
  private plaidClient: PlaidApi;

  constructor() {
    this.plaidClient = new PlaidApi(config);
  }

  public async getLinkToken(userId?: string) {
    userId = ACCOUNT_ID;
    const request: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: clientName,
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    };

    const response = await this.plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;
    return linkToken;
  }

  public async exchangePublicToken(
    publicToken: string
  ): Promise<ItemPublicTokenExchangeResponse> {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    console.log("Exchange Response: ", response.data);

    ACCESS_TOKEN = response.data.access_token;
    ITEM_ID = response.data.item_id;

    return response.data;
  }

  public async getTransactions() {
    // Set cursor to empty to receive all historical updates
    let cursor = "";

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

export const plaidRepository = new PlaidRepository();
