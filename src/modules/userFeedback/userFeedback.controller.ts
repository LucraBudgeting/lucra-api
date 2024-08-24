import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { userFeedbackRepository } from '@/data/repositories/userFeedback.repository';

export async function CreateUserFeedback(
  req: FastifyRequest<{ Body: { feedback: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { feedback } = req.body;

  await userFeedbackRepository.create(user.id, feedback);

  return reply.send({
    message: 'Feedback Created',
  });
}
