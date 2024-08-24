import { User } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserGuideService } from './userGuide.service';

export async function GetGuides(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;
  const guideService = new UserGuideService(user);
  const guides = await guideService.getUserGuides();

  return reply.send({
    message: 'Guides Fetched',
    guides: guides.guides,
    progress: guides.progress,
  });
}
export async function CompleteGuide(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const { id } = req.params;
  const guideService = new UserGuideService(user);
  await guideService.completeGuide(id);

  return reply.send({ message: 'Guide Completed' });
}
