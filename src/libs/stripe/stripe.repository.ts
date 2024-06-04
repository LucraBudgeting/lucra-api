import { User } from '@prisma/client';
import { API_URL, FRONTEND_ORIGIN, STRIPE_PRICE_ID } from '@/config';
import { CreateStripeCustomer } from './stripe.types';
import { stripe } from './stripe';

export class StripeRepository {
  private user?: User;

  public setUser(user: User) {
    this.user = user;
  }

  public async createCustomer(payload: CreateStripeCustomer) {
    return await stripe.customers.create({
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      metadata: {
        userId: payload.userId,
      },
    });
  }

  private async createCustomBillingPortal(customerId: string) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${FRONTEND_ORIGIN}/dashboard`,
    });
  }

  public async getBillingPortalUrl(customerId: string) {
    const billingSession = await this.createCustomBillingPortal(customerId);
    return billingSession.url;
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
