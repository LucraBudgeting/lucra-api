import { AccountTypes } from '@prisma/client';

export function MapPlaidAccountType(type: string): AccountTypes {
  switch (type) {
    case 'depository':
      return AccountTypes.Checking;
    case 'credit':
      return AccountTypes.CreditCard;
    case 'loan':
      return AccountTypes.Loan;
    case 'mortgage':
      return AccountTypes.Mortgage;
    case 'investment':
      return AccountTypes.Investment;
    default:
      return AccountTypes.Other;
  }
}
