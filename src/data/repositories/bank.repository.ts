import { IAccount } from '@/modules/bank/types/bankAccount';
import { BaseRepository } from './base.repository';

class BankRepository extends BaseRepository {
  async getBankAccounts(userId: string): Promise<IAccount[]> {
    const accounts = await this.client.account.findMany({
      where: {
        accessToken: {
          userId: userId,
        },
      },
      include: {
        accessToken: true,
        bankInstitution: true,
        accountBalance: {
          orderBy: {
            lastUpdated: 'desc',
          },
          take: 1,
        },
      },
    });

    // Map each account to a Plaid bank account object and return the result.
    return accounts.map((account) => {
      const {
        id,
        institutionDisplayName,
        accessAccountId,
        institutionId,
        type,
        subType,
        accountBalance,
        bankInstitution,
        accessToken,
      } = account;

      return {
        id,
        accountName: institutionDisplayName,
        accessAccountId,
        institutionId,
        type,
        subType,
        mask: account.mask,
        accountBalance: {
          id: accountBalance[0]?.id,
          plaidAccountId: accountBalance[0]?.accountId,
          currentBalance: accountBalance[0]?.current.toNumber(),
          availableBalance: accountBalance[0]?.available.toNumber(),
          limit: accountBalance[0]?.limit?.toNumber() ?? 0,
          currency: accountBalance[0]?.isoCurrency,
          lastUpdated: accountBalance[0]?.lastUpdated,
        },
        bankInstitution: {
          id: bankInstitution?.id,
          name: bankInstitution?.name,
          logoUrl: bankInstitution?.logo,
          primaryColor: bankInstitution?.primaryColor,
          website: bankInstitution?.website,
        },
        itemId: accessToken?.providerItemId,
      } as IAccount & { itemId?: string };
    });
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    await this.client.account.delete({
      where: {
        id: accountId,
      },
    });
  }
}

export const bankAccountRepository = new BankRepository();
