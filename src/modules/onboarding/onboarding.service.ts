import { User } from '@prisma/client';
import { StripeRepository } from '@/libs/stripe/stripe.repository';
import { CreateStripeCustomer } from '@/libs/stripe/stripe.types';

export async function SetupBetaUserBilling(user: User): Promise<{ customerId: string }> {
  const stripeRepository = new StripeRepository();
  stripeRepository.setUser(user);

  const createCustomerPayload = new CreateStripeCustomer(user);
  const customer = await stripeRepository.createCustomer(createCustomerPayload, { isBeta: 'true' });
  return { customerId: customer.id };
}
