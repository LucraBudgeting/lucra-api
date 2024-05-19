import { UserAuth } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';
import { cryptHash } from '@/libs/bcrypt';

type UserAuthResponse = UserAuth | null;

class UserAuthRepository extends BaseRepository {
  async findAuthByUserId(userId: string): Promise<UserAuthResponse> {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Find Auth By User Id: User Id is null or empty');
    }

    return this.client.userAuth.findFirst({
      where: {
        userId,
      },
    });
  }

  async createUserAuth(userId: string, password: string): Promise<UserAuthResponse> {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Create User Auth: User Id is null or empty');
    }

    if (password.isNullOrEmpty()) {
      throw new ValidationError('Cannot Create User Auth: Password is null or empty');
    }

    const passwordHash = await cryptHash(password);
    return this.client.userAuth.create({
      data: {
        userId,
        passwordHash,
      },
    });
  }
}

export const userAuthRepository = new UserAuthRepository();
