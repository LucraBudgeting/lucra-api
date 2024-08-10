import { IAccount, IBankAccountResponse, bankAccountType } from '@/modules/bank/types/bankAccount';

export function mapAccountsToResponse(accounts: IAccount[]): IBankAccountResponse[] {
  return accounts.map((account) => {
    const bankAccount: IBankAccountResponse = {
      id: account.id,
      linkSource: 'plaid',
      type: mapAccountType(account.type),
      subType: account.subType,
      accountName: account.accountName,
      mask: account.mask ?? '0000',
      balance: {
        currentBalance: account.accountBalance?.currentBalance ?? 0,
        availableBalance: account.accountBalance?.availableBalance ?? 0,
        currency: account.accountBalance?.currency ?? 'USD',
        lastUpdated: account.accountBalance?.lastUpdated ?? new Date(),
      },
      institution: {
        displayName: account.bankInstitution?.displayName,
        logoUrl: account.bankInstitution?.logoUrl,
        primaryColor: account.bankInstitution?.primaryColor,
        website: account.bankInstitution?.website,
      },
    };

    return bankAccount;
  });
}

function mapAccountType(type: string): bankAccountType {
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
