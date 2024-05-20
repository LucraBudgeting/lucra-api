import { User, UserStatus } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

type UserResponse = User | null;

class UserRepository extends BaseRepository {
  async findUserByEmail(email: string): Promise<UserResponse> {
    if (!email.isValidEmail()) {
      throw new ValidationError('Cannot Find User By Email: Invalid email address');
    }

    return this.client.user.findFirst({
      where: {
        email,
      },
    });
  }

  async doesUserWithEmailExist(email: string): Promise<boolean> {
    if (!email.isValidEmail()) {
      throw new ValidationError('Cannot Find User By Email: Invalid email address');
    }

    const user = await this.client.user.findFirst({
      where: {
        email,
      },
    });

    return user !== null;
  }

  async findUserByUsername(username: string): Promise<UserResponse> {
    if (username.isNullOrEmpty()) {
      throw new ValidationError('Cannot Find User By Username: Username is null or empty');
    }

    return this.client.user.findFirst({
      where: {
        username,
      },
    });
  }

  async findUserById(id: string): Promise<UserResponse> {
    if (id.isNullOrEmpty()) {
      throw new ValidationError('Cannot Find User By Id: Id is null or empty');
    }

    return this.client.user.findFirst({
      where: {
        id,
      },
    });
  }

  async createUser(email: string, fullName: string): Promise<UserResponse> {
    if (!email.isValidEmail()) {
      throw new ValidationError('Cannot Create User: Invalid email address');
    }

    if (fullName.isNullOrEmpty()) {
      throw new ValidationError('Cannot Create User: Full Name is null or empty');
    }

    return this.client.user.create({
      data: {
        email,
        name: fullName,
        status: UserStatus.Onboarding_UnPaid,
      },
    });
  }
}

export const userRepository = new UserRepository();
