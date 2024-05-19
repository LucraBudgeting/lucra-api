import { userRepository } from '@/data/repositories/user.repository';
import { HttpStatusCode } from 'axios';
import { FastifyRequest, FastifyReply } from 'fastify';
import { createAccountBody } from './types';
import { userAuthRepository } from '@/data/repositories/userAuth.repository';
import { SetupUserBilling } from './onboarding.service';

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
  const checkoutUrl = await SetupUserBilling(user);

  return reply
    .status(HttpStatusCode.Ok)
    .send({ message: 'Account created', token: onboardingAccessToken, checkoutUrl });
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
  const checkoutUrl = await SetupUserBilling(user);

  return reply
    .status(HttpStatusCode.Ok)
    .send({ message: 'User found', token: onboardingAccessToken, checkoutUrl });
}
