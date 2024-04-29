import { PaymentChannel } from '@prisma/client';
import { TransactionPaymentChannelEnum } from 'plaid';

export function MapPaymentChannel(channel: TransactionPaymentChannelEnum): PaymentChannel {
  switch (channel.toLowerCase()) {
    case TransactionPaymentChannelEnum.InStore:
      return PaymentChannel.InStore;
    case TransactionPaymentChannelEnum.Online:
      return PaymentChannel.Online;
    default:
      return PaymentChannel.Other;
  }
}
