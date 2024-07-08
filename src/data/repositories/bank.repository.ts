import { IPlaidBankAccount } from '@/modules/bank/types/PlaidBankAccount';
import { BaseRepository } from './base.repository';

class BankRepository extends BaseRepository {
  /**
   * Retrieves Plaid bank accounts for a given user ID.
   * @param userId - The ID of the user.
   * @returns An array of Plaid bank accounts.
   */
  async getPlaidBankAccounts(userId: string): Promise<IPlaidBankAccount[]> {
    // Retrieve Plaid accounts for the given user ID, including the most recent balance for each account.
    const plaidAccounts = await this.client.plaidAccount.findMany({
      where: {
        accessToken: {
          userId: userId,
        },
      },
      include: {
        accessToken: false,
        bankInstitution: true,
        plaidAccountBalance: {
          orderBy: {
            plaidLastUpdated: 'desc',
          },
          take: 1,
        },
      },
    });

    // Map each account to a Plaid bank account object and return the result.
    return plaidAccounts.map((account) => {
      const {
        id,
        accountId,
        institutionDisplayName,
        accessAccountId,
        institutionId,
        type,
        subType,
        plaidAccountBalance,
        bankInstitution,
      } = account;

      return {
        id,
        plaidAccountId: accountId,
        institutionDisplayName,
        accessAccountId,
        institutionId,
        type,
        subType,
        mask: account.mask,
        plaidAccountBalance: {
          id: plaidAccountBalance[0]?.id,
          plaidAccountId: plaidAccountBalance[0]?.accountId,
          currentBalance: plaidAccountBalance[0]?.current.toNumber(),
          availableBalance: plaidAccountBalance[0]?.available.toNumber(),
          currency: plaidAccountBalance[0]?.isoCurrency,
          plaidLastUpdated: plaidAccountBalance[0]?.plaidLastUpdated,
        },
        bankInstitution: {
          id: bankInstitution?.id,
          name: bankInstitution?.name,
          logoUrl: bankInstitution?.logo,
          primaryColor: bankInstitution?.primaryColor,
          website: bankInstitution?.website,
        },
      } as IPlaidBankAccount;
    });
  }
}

export const bankAccountRepository = new BankRepository();
