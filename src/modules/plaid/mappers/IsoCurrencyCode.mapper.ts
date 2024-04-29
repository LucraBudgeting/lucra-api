import { IsoCurrencyCode } from '@prisma/client';

export function MapPlaidIsoCode(isoCode: string | null): IsoCurrencyCode {
  switch (isoCode) {
    case 'USD':
      return IsoCurrencyCode.USD;
    default:
      return IsoCurrencyCode.USD;
  }
}
