import { bankAccountRepository } from '@/data/repositories/bank.repository';
import { IBankAccountResponse } from '../types/bankAccount';
import { IPlaidBankAccount } from '../types/PlaidBankAccount';

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
function mapPlaidAccounts(plaidAccounts: IPlaidBankAccount[]): IBankAccountResponse[] {
  // Map each Plaid bank account to a bank account object
  return plaidAccounts.map((account) => {
    // Create a new bank account object
    const bankAccount: IBankAccountResponse = {
      id: account.id, // Set the ID of the bank account
      linkSource: 'plaid', // Set the link source to 'plaid'
      type: account.type, // Set the type of the bank account
      subType: account.subType, // Set the subtype of the bank account
      accountName: account.institutionDisplayName, // Set the account name to the institution display name
      mask: account.mask ?? '0000', // Set the mask of the bank account
      balance: {
        currentBalance: account.plaidAccountBalance?.currentBalance ?? 0, // Set the current balance
        availableBalance: account.plaidAccountBalance?.availableBalance ?? 0, // Set the available balance
        currency: account.plaidAccountBalance?.currency ?? 'USD', // Set the currency
        lastUpdated: account.plaidAccountBalance?.plaidLastUpdated ?? new Date(), // Set the last updated date
      },
      institution: {
        displayName: account.bankInstitution?.name, // Set the display name of the institution
        logoUrl: account.bankInstitution?.logoUrl, // Set the logo URL of the institution
        primaryColor: account.bankInstitution?.primaryColor, // Set the primary color of the institution
        website: account.bankInstitution?.website, // Set the website of the institution
      },
    };

    return bankAccount;
  });
}
