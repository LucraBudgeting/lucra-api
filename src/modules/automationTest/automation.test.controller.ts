import { FastifyRequest, FastifyReply } from 'fastify';
import { userRepository } from '@/data/repositories/user.repository';
import { StripeRepository } from '@/libs/stripe/stripe.repository';

export async function DeleteTestUser(
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const { userId } = req.params;

  const stripeRepository = new StripeRepository();

  await stripeRepository.deleteCustomerByUserId(userId);
  await userRepository.deleteUserById(userId);

  return reply.send({
    message: 'User deleted',
  });
}
