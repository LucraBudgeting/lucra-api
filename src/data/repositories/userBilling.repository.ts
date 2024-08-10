import { BillingPlatform } from '@prisma/client';
import { NotFoundError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class UserBillingRepository extends BaseRepository {
  public async createStripeBilling(userId: string, customerId: string) {
    await this.client.userBilling.create({
      data: {
        userId: userId,
        billingPlatform: BillingPlatform.STRIPE,
        stripeCustomerId: customerId,
        amount: 0,
        currency: 'USD',
      },
    });
  }

  public async getUserBillingByUserId(userId: string) {
    return this.client.userBilling.findFirst({
      where: {
        userId,
      },
    });
  }

  public async getUserBillingCustomerId(userId: string): Promise<string> {
    const userBilling = await this.getUserBillingByUserId(userId);

    if (!userBilling) {
      throw new NotFoundError('User billing not found');
    }

    switch (userBilling.billingPlatform) {
      case BillingPlatform.STRIPE:
        if (userBilling.stripeCustomerId) {
          return userBilling.stripeCustomerId;
        } else {
          throw new NotFoundError('Stripe customer id not found');
        }
      case BillingPlatform.APPLE:
        if (userBilling.appleReceipt) {
          return userBilling.appleReceipt;
        } else {
          throw new NotFoundError('Stripe customer id not found');
        }
      case BillingPlatform.GOOGLE:
        if (userBilling.googleOrderId) {
          return userBilling.googleOrderId;
        } else {
          throw new NotFoundError('Stripe customer id not found');
        }
      default:
        throw new Error('Unsupported billing platform');
    }
  }
}

export const userBillingRepository = new UserBillingRepository();
