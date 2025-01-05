import { SessionType, User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { getUserAgentFromRequest } from '@/utils/userAgent';
import { TransactionService } from '../transaction/transaction.service';
import {
  AuthCheckByUserId,
  DeleteAllUserData,
  LoginUserByEmail,
  LoginUserByUsername,
  recordUserLoginSession,
} from './authentication.service';

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

  const userAgent = getUserAgentFromRequest(req);
  userAgent.sessionType = SessionType.LOGIN;
  await recordUserLoginSession(user.id, userAgent);

  return reply.send({ message: 'Successful Login', user, accessToken });
}

export async function AuthCheck(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as User;
  const freshUser = await AuthCheckByUserId(user.id);

  const transactionService = new TransactionService(user.id);
  const doesNeedSync = await transactionService.triggerLatestSync();

  const userAgent = getUserAgentFromRequest(req);
  userAgent.sessionType = SessionType.CHECK;
  await recordUserLoginSession(user.id, userAgent);

  const accessToken = await reply.jwtSign({ user: freshUser });

  return reply.send({ message: 'Check', accessToken, user: freshUser, doesNeedSync });
}

export async function AuthDeleteAllUserData(
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  const userId = req.params.userId;
  if (user.id !== userId) {
    return reply.status(403).send({ message: 'You are not authorized to delete this user' });
  }
  await DeleteAllUserData(user.id);
  return reply.send({ message: 'Delete All User Data' });
}
