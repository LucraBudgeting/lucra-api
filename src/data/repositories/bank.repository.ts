import { IAccount } from '@/modules/bank/types/PlaidBankAccount';
import { BaseRepository } from './base.repository';

class BankRepository extends BaseRepository {
  async getPlaidBankAccounts(userId: string): Promise<IAccount[]> {
    const accounts = await this.client.account.findMany({
      where: {
        accessToken: {
          userId: userId,
        },
      },
      include: {
        accessToken: false,
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
      } = account;

      return {
        id,
        institutionDisplayName,
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
          currency: accountBalance[0]?.isoCurrency,
          plaidLastUpdated: accountBalance[0]?.lastUpdated,
        },
        bankInstitution: {
          id: bankInstitution?.id,
          name: bankInstitution?.name,
          logoUrl: bankInstitution?.logo,
          primaryColor: bankInstitution?.primaryColor,
          website: bankInstitution?.website,
        },
      } as unknown as IAccount;
    });
  }
}

export const bankAccountRepository = new BankRepository();
