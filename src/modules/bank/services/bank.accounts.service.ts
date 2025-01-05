import { bankAccountRepository } from '@/data/repositories/bank.repository';
import { accountAccessRepository } from '@/data/repositories/accountAccess.repository';
import { plaidRepository } from '@/libs/plaid/plaid.repository';
import { IAccount } from '../types/bankAccount';

export class BankAccountService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getBankAccounts(): Promise<IAccount[]> {
    return await bankAccountRepository.getBankAccounts(this.userId);

    // return mapAccountsToResponse(bankAccounts);
  }

  async deleteBankAccounts(): Promise<void> {
    const accountAccessList = await accountAccessRepository.getAccountAccessByUserId(this.userId);

    if (accountAccessList.length === 0) {
      return;
    }

    for (const accountAccess of accountAccessList) {
      await plaidRepository.deleteAccountAccess(accountAccess.accessToken);
      await bankAccountRepository.deleteBankAccount(accountAccess.id);
    }
  }
}
