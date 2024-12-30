import { User } from '@prisma/client';
import { API_URL, FRONTEND_ORIGIN, STRIPE_PRICE_ID } from '@/config';
import { userBillingRepository } from '@/data/repositories/userBilling.repository';
import { CreateStripeCustomer } from './stripe.types';
import { stripe } from './stripe';

export class StripeRepository {
  private user?: User;

  public setUser(user: User) {
    this.user = user;
    return this;
  }

  public async createCustomer(payload: CreateStripeCustomer, metadata?: Record<string, string>) {
    return await stripe.customers.create({
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      metadata: {
        userId: payload.userId,
        ...metadata,
      },
    });
  }

  private async createCustomBillingPortal(customerId: string, returnUrl?: string) {
    returnUrl = returnUrl || `${FRONTEND_ORIGIN}/dashboard`;
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  public async getBillingPortalUrl(customerId: string, returnUrl?: string) {
    const billingSession = await this.createCustomBillingPortal(customerId, returnUrl);
    return billingSession.url;
  }

  public async deleteCustomerByUserId(userId: string) {
    const userBilling = await userBillingRepository.getUserBillingByUserId(userId);

    if (!userBilling || !userBilling.stripeCustomerId) {
      return;
    }

    await stripe.customers.del(userBilling.stripeCustomerId);
  }

  private async onboardingCheckout(customerId: string) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      currency: 'usd',
      success_url: `${API_URL}/api/onboarding/finalize_billing_connected/${this.user?.id}`,
    });
  }

  public async getOnboardingCheckoutUrl(customerId: string): Promise<string> {
    const checkoutSession = await this.onboardingCheckout(customerId);
    if (!checkoutSession.url) {
      throw new Error('Error creating checkout session');
    }
    return checkoutSession.url;
  }
}
