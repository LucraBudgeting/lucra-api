import { User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthCheckByUserId, LoginUserByEmail, LoginUserByUsername } from './authentication.service';

export async function AuthLogin(
  req: FastifyRequest<{
    Body: { email?: string; username?: string; password: string };
  }>,
  reply: FastifyReply
) {
  const { email, username, password } = req.body;
  let user: User | null = null;
  if (email) {
    user = await LoginUserByEmail(email, password);
  } else if (username) {
    user = await LoginUserByUsername(username, password);
  } else {
    return reply.status(400).send({ message: 'Username or Email is required' });
  }

  if (!user) {
    return reply.status(400).send({ message: 'An unexpected error occurred' });
  }

  const accessToken = await reply.jwtSign({ user });

  return reply.send({ message: 'Successful Login', user, accessToken });
}

export async function AuthCheck(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;
  const freshUser = await AuthCheckByUserId(user.id);

  const accessToken = await reply.jwtSign({ user: freshUser });

  return reply.send({ message: 'Check', accessToken, user: freshUser });
}
