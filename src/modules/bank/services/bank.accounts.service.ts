import { bankAccountRepository } from '@/data/repositories/bank.repository';
import { mapPlaidAccounts } from '@/modules/plaid/services/plaid.mapper.service';
import { IBankAccountResponse } from '../types/bankAccount';

export class BankAccountService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Retrieves the bank accounts associated with the user.
   * @returns {Promise<IBankAccountResponse[]>} An array of bank account objects.
   */
  async getBankAccounts(): Promise<IBankAccountResponse[]> {
    // Retrieve the Plaid bank accounts associated with the user
    const plaidAccounts = await bankAccountRepository.getPlaidBankAccounts(this.userId);

    // Map the bank accounts to bank account objects and return the result
    return [...mapPlaidAccounts(plaidAccounts)];
  }
}

/**
 * Maps an array of Plaid bank accounts to an array of bank account objects.
 *
 * @param {IPlaidBankAccount[]} plaidAccounts - The array of Plaid bank accounts.
 * @returns {IBankAccountResponse[]} - The array of bank account objects.
 */
