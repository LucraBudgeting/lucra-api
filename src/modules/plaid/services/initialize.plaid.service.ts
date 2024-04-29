import { PlaidAccount, PlaidAccountBalance, PlaidTransaction } from '@prisma/client';
import { Record } from '@fastify/type-provider-typebox';
import { plaidAccountAccessRepository } from '@/data/repositories/plaidAccountAccess.repository';
import { userRepository } from '@/data/repositories/user.repository';
import { userPreferencesRepository } from '@/data/repositories/userPreferences.repository';
import { BadRequestError, ServiceUnavailableError, ValidationError } from '@/exceptions/error';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { plaidAccountRepository } from '@/data/repositories/plaidAccount.repository';
import { plaidAccountBalanceRepository } from '@/data/repositories/plaidAccountBalance.repository';
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';

export async function createLinkToken(userId: string) {
  if (userId.isNullOrEmpty()) {
    throw new ValidationError('User ID is required to create link token');
  }

  const userPreferences = await userPreferencesRepository.getUserPreferences(userId);
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const linkToken = await plaidRepository.createLinkToken(user, userPreferences);

  if (!linkToken) {
    throw new ServiceUnavailableError('Link token not created');
  }
}

export async function exchangePublicToken(userId: string, publicToken: string): Promise<void> {
  if (userId.isNullOrEmpty()) {
    throw new ValidationError('User ID is required to exchange public token');
  }

  const accessToken = await plaidRepository.exchangePublicToken(publicToken);

  await syncAccountsAndTransactions(userId, accessToken);
}

async function syncAccountsAndTransactions(userId: string, accessToken: string): Promise<void> {
  if (accessToken.isNullOrEmpty()) {
    throw new ServiceUnavailableError('Public token could not be exchanged');
  }

  const plaidAccountAccess = await plaidAccountAccessRepository.createPlaidAccountAccess(
    userId,
    accessToken
  );

  if (plaidAccountAccess?.accessToken.isNullOrEmpty()) {
    throw new ServiceUnavailableError('Plaid account access could not be created');
  }

  const accountIds = await syncAccounts(plaidAccountAccess.accessToken);
  await syncTransactionHistory(accountIds, plaidAccountAccess.accessToken);
}

async function syncAccounts(accessTokenId: string): Promise<Record<string, string>> {
  const accountDetails = await plaidRepository.getAccounts(accessTokenId);

  const balances: PlaidAccountBalance[] = [];

  const plaidAccounts = accountDetails.accounts.map((account): PlaidAccount => {
    balances.push({
      accountId: account.account_id,
      available: BigInt(account.balances.available ?? 0),
      current: BigInt(account.balances.current ?? 0),
      limit: BigInt(account.balances.limit ?? 0),
      isoCurrency: MapPlaidIsoCode(account.balances.iso_currency_code),
    } as PlaidAccountBalance);

    return {
      accessTokenId: accessTokenId,
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
  await plaidAccountBalanceRepository.createPlaidAccountBalanceMany(balances);

  const dictionary: { [key: number]: string } = {};

  newAccountIds.forEach((value, index) => {
    dictionary[index] = value;
  });

  return dictionary;
}

async function syncTransactionHistory(_accountIds: Record<string, string>, accessTokenId: string) {
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const transactionsData = await plaidRepository.syncTransaction(accessTokenId, cursor);
    hasMore = transactionsData.has_more;
    cursor = transactionsData.next_cursor;

    const _transactions = transactionsData.added.map((transaction): PlaidTransaction => {
      return {
        // accessTokenId: '',
        accountId: transaction.account_id,
      } as PlaidTransaction;
    });
  }
}
