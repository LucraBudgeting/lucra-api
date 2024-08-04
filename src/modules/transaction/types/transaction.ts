import { Decimal } from '@prisma/client/runtime/library';
import { Transaction as plaidTransaction } from 'plaid';
import { IsoCurrencyCode, PaymentChannel, Transaction } from '@/data/db.client';
import { MapPaymentChannel } from '@/modules/plaid/mappers/PaymentChannel.mapper';

export interface ITransactionRequest extends Transaction {}
export interface ITransactionResponse extends Transaction {
  id: string;
  categoryId?: string;
}

export interface ITransactionDto extends Transaction {
  [key: string]: any;
}

export class TransactionDto implements ITransactionDto {
  id: string = undefined as unknown as string;
  userId: string = '';
  accountId: string = '';
  amount: Decimal = new Decimal(0);
  date: Date = new Date();
  isoCurrencyCode = IsoCurrencyCode.USD;
  merchantName: string | null = null;
  name: string | null = null;
  pending: boolean = false;
  paymentChannel: PaymentChannel = PaymentChannel.Other;
  addressId: string | null = null;
  budgetCategoryId: string | null = null;
  dateCreated: Date = new Date();
  dateUpdated: Date = new Date();
  categoryConfidenceLevel: string | null = '';
  categoryPrimary: string | null = '';
  categoryDetailed: string | null = '';

  constructor(userId: string) {
    this.userId = userId;
  }

  [key: string]: any;

  public fromPlaidTransaction(
    plaidTransaction: plaidTransaction,
    accountIds: Record<string, string>
  ) {
    this.accountId = accountIds[plaidTransaction.account_id] ?? '';
    this.amount = new Decimal(plaidTransaction.amount);
    this.date = new Date(plaidTransaction.date);
    this.merchantName = plaidTransaction.merchant_name ?? null;
    this.name = plaidTransaction.name;
    this.pending = plaidTransaction.pending;
    this.paymentChannel = MapPaymentChannel(plaidTransaction.payment_channel);
    this.isoCurrencyCode = plaidTransaction.iso_currency_code as IsoCurrencyCode;
    this.categoryConfidenceLevel =
      plaidTransaction.personal_finance_category?.confidence_level ?? '';
    this.categoryPrimary = plaidTransaction.personal_finance_category?.primary ?? '';
    this.categoryDetailed = plaidTransaction.personal_finance_category?.detailed ?? '';

    return this;
  }
}
