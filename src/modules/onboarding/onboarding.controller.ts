import { HttpStatusCode } from 'axios';
import { FastifyRequest, FastifyReply } from 'fastify';
import { userRepository } from '@/data/repositories/user.repository';
import { userAuthRepository } from '@/data/repositories/userAuth.repository';
import { userOnboardingStageRepository } from '@/data/repositories/userOnboardingStage.repository';
import { User } from '@/data/db.client';
import { FRONTEND_ORIGIN } from '@/config';
import { userBillingRepository } from '@/data/repositories/userBilling.repository';
import { CategoryService } from '../budget/category.service';
import { SetupBetaUserBilling } from './onboarding.service';
import { createAccountBody } from './types';

export async function DoesEmailAlreadyExist(
  req: FastifyRequest<{ Params: { email: string } }>,
  reply: FastifyReply
) {
  const { email } = req.params;
  const userDoesExist = await userRepository.doesUserWithEmailExist(email);

  if (userDoesExist) {
    return reply
      .status(HttpStatusCode.Forbidden)
      .send({ message: 'Account with email already exists' });
  }

  return reply.status(HttpStatusCode.Ok).send({ message: 'Account with email does not exist' });
}

export async function CreateAccount(
  req: FastifyRequest<{ Body: createAccountBody }>,
  reply: FastifyReply
) {
  const { email, fullName, password } = req.body;

  const userDoesExist = await userRepository.doesUserWithEmailExist(email);

  if (userDoesExist) {
    return reply
      .status(HttpStatusCode.Forbidden)
      .send({ message: 'Account with email already exists' });
  }

  const user = await userRepository.createUser(email, fullName);

  if (!user) {
    return reply
      .status(HttpStatusCode.InternalServerError)
      .send({ message: 'Account not created' });
  }

  const userAuth = await userAuthRepository.createUserAuth(user.id, password);

  if (!userAuth) {
    return reply
      .status(HttpStatusCode.InternalServerError)
      .send({ message: 'Account not created' });
  }

  const onboardingAccessToken = await reply.jwtSign({ user });
  const { customerId } = await SetupBetaUserBilling(user);

  await userBillingRepository.createStripeBilling(user.id, customerId);

  await userOnboardingStageRepository.createUser(user.id);

  const categoryService = new CategoryService(user.id);
  await categoryService.getOrCreateTransferCategory();
  await categoryService.createBlueprintCategories();

  return reply
    .status(HttpStatusCode.Ok)
    .send({ message: 'Account created', token: onboardingAccessToken });
}

export async function GetUser(
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const { userId } = req.params;
  const user = await userRepository.findUserById(userId);

  if (!user) {
    return reply.status(HttpStatusCode.NotFound).send({ message: 'User not found' });
  }

  const onboardingAccessToken = await reply.jwtSign({ user });
  const checkoutUrl = await SetupBetaUserBilling(user);

  return reply
    .status(HttpStatusCode.Ok)
    .send({ message: 'User found', token: onboardingAccessToken, checkoutUrl });
}

// DEPRICATED
export async function SyncAccounts(
  req: FastifyRequest<{ Params: { publicToken: string } }>,
  reply: FastifyReply
) {
  const user = req.user as User;
  // await new ConnectAccountsService(user.id).syncAccounts(req.params.publicToken);
  await userOnboardingStageRepository.markBankingAccountConnected(user.id);

  return reply.status(HttpStatusCode.Ok).send({ message: 'Accounts Synced' });
}

export async function FinalizeBilling(
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  const redirectUrl = `${FRONTEND_ORIGIN}/auth/login`;

  await userOnboardingStageRepository.markBillingConnected(req.params.userId);

  return reply.redirect(HttpStatusCode.Found, redirectUrl);
}
