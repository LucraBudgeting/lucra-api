export interface IBankAccountResponse extends IBankAccount {}

export type bankAccountType = 'depository' | 'credit' | 'investment' | 'loan' | 'other';

interface IBankAccount {
  id: string;
  linkSource: 'plaid';
  type: bankAccountType;
  subType: string;
  mask: string;
  accountName: string;
  institution?: IBankInstitution;
  balance?: IBankBalance;
}

export interface IBankBalance {
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: Date;
}

export interface IBankInstitution {
  displayName?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface IAccount {
  id: string;
  institutionDisplayName: string;
  accessAccountId: string;
  institutionId: string;
  type: string;
  subType: string;
  mask: string;
  accountBalance?: IBankBalance;
  bankInstitution?: IBankInstitution;
}
