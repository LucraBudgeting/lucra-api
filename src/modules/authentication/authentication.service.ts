import { User } from '@prisma/client';
import { userRepository } from '@/data/repositories/user.repository';
import { userAuthRepository } from '@/data/repositories/userAuth.repository';
import { BadRequestError, NotFoundError } from '@/exceptions/error';
import { stringMatchesHash } from '@/libs/bcrypt';
import { UserAgent } from '@/utils/userAgent';
import { BankAccountService } from '../bank/services/bank.accounts.service';

export async function LoginUserByUsername(username: string, password: string) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new NotFoundError(`User with username ${username} not found`);
  }

  await validateAuthFromUser(user, password);

  return user;
}

export async function LoginUserByEmail(email: string, password: string): Promise<User> {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  await validateAuthFromUser(user, password);

  return user;
}

export async function recordUserLoginSession(userId: string, userAgent: UserAgent) {
  await userRepository.recordUserSession(userId, userAgent);
}

async function validateAuthFromUser(user: User, password: string): Promise<void> {
  const userAuth = await userAuthRepository.findAuthByUserId(user.id);

  if (!userAuth) {
    throw new NotFoundError(`User auth with id ${user.id} not found`);
  }

  await doesPasswordMatch(password, userAuth.passwordHash);
}

async function doesPasswordMatch(password: string, hashedPassword: string | null): Promise<void> {
  if (!hashedPassword) {
    throw new NotFoundError('Password not found');
  }
  const isMatch = await stringMatchesHash(password, hashedPassword);
  if (!isMatch) {
    throw new BadRequestError('Incorrect password');
  }
}

export async function AuthCheckByUserId(userId: string) {
  const user = await userRepository.findUserById(userId);
  return user;
}

export async function DeleteAllUserData(userId: string) {
  const bankAccountService = new BankAccountService(userId);
  await bankAccountService.deleteBankAccounts();
  await userRepository.deleteUserById(userId);
}
