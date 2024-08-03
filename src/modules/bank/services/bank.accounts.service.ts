import { bankAccountRepository } from '@/data/repositories/bank.repository';
import { IBankAccountResponse } from '../types/bankAccount';
import { mapAccountsToResponse } from './account.mapper.service';

export class BankAccountService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getBankAccounts(): Promise<IBankAccountResponse[]> {
    const plaidAccounts = await bankAccountRepository.getPlaidBankAccounts(this.userId);

    return mapAccountsToResponse(plaidAccounts);
  }
}
