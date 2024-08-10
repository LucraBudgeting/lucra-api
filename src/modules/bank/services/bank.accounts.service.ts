import { bankAccountRepository } from '@/data/repositories/bank.repository';
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
}
