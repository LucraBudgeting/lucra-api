import { FRONTEND_ORIGIN } from "@/config";
import { CreateStripeCustomer } from "./stripe.types";
import { stripe } from "./stripe";

const initialSubscriptionId = "price_1OmQJ5GOia2yQ2r4bS5OGSHT";

class StripeRepository {
  public async createCustomer(payload: CreateStripeCustomer) {
    return await stripe.customers.create({
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      address: {
        line1: payload.address.street1,
        line2: payload.address.street2,
        city: payload.address.city,
        state: payload.address.state,
        postal_code: payload.address.postalCode,
      },
      metadata: {
        companyId: payload.companyId,
      },
    });
  }

  private async createCustomBillingPortal(customerId: string) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${FRONTEND_ORIGIN}/events`,
    });
  }

  public async getBillingPortalUrl(customerId: string) {
    const billingSession = await this.createCustomBillingPortal(customerId);
    return billingSession.url;
  }

  private async initCheckout(customerId: string) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: initialSubscriptionId,
          quantity: 1,
        },
      ],
      currency: "usd",
      success_url: `${FRONTEND_ORIGIN}/events`,
      // cancel_url: `${FRONTEND_ORIGIN}/auth`,
    });
  }

  public async getInitCheckoutUrl(customerId: string): Promise<string> {
    const checkoutSession = await this.initCheckout(customerId);
    if (!checkoutSession.url) {
      throw new Error("Error creating checkout session");
    }
    return checkoutSession.url;
  }
}

export const stripeRepository = new StripeRepository();
