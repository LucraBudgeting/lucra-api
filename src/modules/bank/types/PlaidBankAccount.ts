export interface IPlaidBankAccount {
  id: string;
  plaidAccountId: string;
  institutionDisplayName: string;
  accessAccountId: string;
  institutionId: string;
  type: string;
  subType: string;
  plaidAccountBalance?: IPlaidAccountBalance;
  bankInstitution?: IPlaidBankInstitution;
}

export interface IPlaidBankInstitution {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  website: string;
}

export interface IPlaidAccountBalance {
  id: string;
  plaidAccountId: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  plaidLastUpdated: Date;
}
