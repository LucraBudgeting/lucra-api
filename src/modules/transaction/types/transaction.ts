import { Decimal } from '@prisma/client/runtime/library';
import { Transaction as plaidTransaction } from 'plaid';
import { IsoCurrencyCode, PaymentChannel, Transaction } from '@/data/db.client';
import { MapPaymentChannel } from '@/modules/plaid/mappers/PaymentChannel.mapper';

export interface ITransactionRequest extends Transaction {}
export interface ITransactionResponse extends Transaction {
  id: string;
}

export interface ITransactionDto extends Transaction {
  [key: string]: any;
}

export class TransactionDto implements ITransactionDto {
  id: string = undefined as unknown as string;
  userId: string = '';
  amount: Decimal = new Decimal(0);
  date: Date = new Date();
  isoCurrencyCode = IsoCurrencyCode.USD;
  merchantName: string | null = null;
  name: string | null = null;
  pending: boolean = false;
  paymentChannel: PaymentChannel = PaymentChannel.Other;
  addressId: string | null = null;
  categoryId: string | null = null;
  dateCreated: Date = new Date();
  dateUpdated: Date = new Date();

  constructor(userId: string) {
    this.userId = userId;
  }

  public fromPlaidTransaction(plaidTransaction: plaidTransaction) {
    this.amount = new Decimal(plaidTransaction.amount);
    this.date = new Date(plaidTransaction.date);
    this.merchantName = plaidTransaction.merchant_name ?? null;
    this.name = plaidTransaction.name;
    this.pending = plaidTransaction.pending;
    this.paymentChannel = MapPaymentChannel(plaidTransaction.payment_channel);
    this.isoCurrencyCode = plaidTransaction.iso_currency_code as IsoCurrencyCode;

    return this;
  }
}
