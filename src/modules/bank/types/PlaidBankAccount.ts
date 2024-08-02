import { IBankBalance, IBankInstitution } from './bankAccount';

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
