import { User } from '@prisma/client';
import { StripeRepository } from '@/libs/stripe/stripe.repository';
import { CreateStripeCustomer } from '@/libs/stripe/stripe.types';

export async function SetupUserBilling(user: User) {
  const stripeRepository = new StripeRepository();
  stripeRepository.setUser(user);

  const createCustomerPayload = new CreateStripeCustomer(user);
  const customer = await stripeRepository.createCustomer(createCustomerPayload);

  return await stripeRepository.getOnboardingCheckoutUrl(customer.id);
}
