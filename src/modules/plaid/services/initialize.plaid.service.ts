import { PlaidAccount, PlaidAccountBalance, PlaidTransaction } from '@prisma/client';
import { Record } from '@fastify/type-provider-typebox';
import { Decimal } from '@prisma/client/runtime/library';
import { plaidAccountAccessRepository } from '@/data/repositories/plaidAccountAccess.repository';
import { userRepository } from '@/data/repositories/user.repository';
import { userPreferencesRepository } from '@/data/repositories/userPreferences.repository';
import { BadRequestError, ServiceUnavailableError, ValidationError } from '@/exceptions/error';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { plaidAccountRepository } from '@/data/repositories/plaidAccount.repository';
import { plaidAccountBalanceRepository } from '@/data/repositories/plaidAccountBalance.repository';
import { plaidTransactionRepository } from '@/data/repositories/plaidTransaction.repository';
import { MapPlaidAccountType } from '../mappers/AccountTypes.mapper';
import { MapPlaidIsoCode } from '../mappers/IsoCurrencyCode.mapper';
import { MapPaymentChannel } from '../mappers/PaymentChannel.mapper';

export async function createLinkToken(userId: string): Promise<string> {
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

  return linkToken;
}

export async function exchangePublicToken(publicToken: string): Promise<string> {
  if (publicToken.isNullOrEmpty()) {
    throw new ValidationError('Public token is required to exchange public token');
  }

  const accessToken = await plaidRepository.exchangePublicToken(publicToken);

  return accessToken;
}

export async function syncAccountsAndTransactions(
  userId: string,
  accessToken: string
): Promise<void> {
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

  const accountIds = await syncAccounts(accessToken, plaidAccountAccess.id);
  await syncTransactionHistory(accountIds, accessToken);
}

async function syncAccounts(
  accessToken: string,
  accountAccessId: string
): Promise<Record<string, string>> {
  const accountDetails = await plaidRepository.getAccounts(accessToken);

  const plaidAccounts = accountDetails.accounts.map((account): PlaidAccount => {
    return {
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

async function syncTransactionHistory(accountIds: Record<string, string>, accessToken: string) {
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const transactionsData = await plaidRepository.syncTransaction(accessToken, cursor);
    hasMore = transactionsData.has_more;
    cursor = transactionsData.next_cursor;

    const transactions = transactionsData.added.map((transaction): PlaidTransaction => {
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

    console.log('HasMore', transactionsData.has_more, 'Cursor', transactionsData.next_cursor);

    console.log('Transactions', transactions.length);

    await plaidTransactionRepository.createPlaidTransactionMany(transactions);
  }
}
