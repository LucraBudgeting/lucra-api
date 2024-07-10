import { bankAccountRepository } from '@/data/repositories/bank.repository';
import { mapPlaidAccounts } from '@/modules/plaid/services/plaid.mapper.service';
import { IBankAccountResponse } from '../types/bankAccount';

export class BankAccountService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getBankAccounts(): Promise<IBankAccountResponse[]> {
    const plaidAccounts = await bankAccountRepository.getPlaidBankAccounts(this.userId);

    // Map the bank accounts to bank account objects and return the result
    return [...mapPlaidAccounts(plaidAccounts)];
  }
}
