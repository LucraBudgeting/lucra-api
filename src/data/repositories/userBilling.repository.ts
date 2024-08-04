import { BillingPlatform } from '@prisma/client';
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
}

export const userBillingRepository = new UserBillingRepository();
