import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { userBillingRepository } from '@/data/repositories/userBilling.repository';
import { StripeRepository } from '@/libs/stripe/stripe.repository';

export async function GetBillingPortalUrl(
  req: FastifyRequest<{ Body: { returnUrl?: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;

  const stripeRepository = new StripeRepository().setUser(user);
  const userBillingId = await userBillingRepository.getUserBillingCustomerId(user.id);

  const portalUrl = await stripeRepository.getBillingPortalUrl(userBillingId);

  return reply.send({
    message: 'Billing portal url',
    portalUrl,
  });
}
