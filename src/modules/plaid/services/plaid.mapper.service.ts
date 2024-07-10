import { IPlaidBankAccount } from '@/modules/bank/types/PlaidBankAccount';
import { IBankAccountResponse, bankAccountType } from '@/modules/bank/types/bankAccount';

export function mapPlaidAccounts(plaidAccounts: IPlaidBankAccount[]): IBankAccountResponse[] {
  // Map each Plaid bank account to a bank account object
  return plaidAccounts.map((account) => {
    // Create a new bank account object
    const bankAccount: IBankAccountResponse = {
      id: account.id, // Set the ID of the bank account
      linkSource: 'plaid', // Set the link source to 'plaid'
      type: mapPlaidType(account.type), // Set the type of the bank account
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

/**
 * Maps a string representing a Plaid account type to a string representing a bank account type.
 *
 * @param {string} type - The string representing the Plaid account type.
 * @return {bankAccountType} The string representing the bank account type.
 */
function mapPlaidType(type: string): bankAccountType {
  switch (type.toLowerCase()) {
    case 'checking':
      return 'depository';
    case 'creditcard':
      return 'credit';
    case 'investment':
      return 'investment';
    case 'loan':
      return 'loan';
    default:
      return 'other';
  }
}
