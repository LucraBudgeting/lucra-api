import { User, UserStatus } from '@prisma/client';
import { ValidationError } from '@/exceptions/error';
import { UserAgent } from '@/utils/userAgent';
import { BaseRepository } from './base.repository';

type UserResponse = User | null;

class UserRepository extends BaseRepository {
  async findUserByEmail(email: string): Promise<UserResponse> {
    if (!email.isValidEmail()) {
      throw new ValidationError('Cannot Find User By Email: Invalid email address');
    }

    email = email.toLowerCase();

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

    email = email.toLowerCase();

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

    email = email.toLowerCase();

    const newUser = await this.client.user.create({
      data: {
        email,
        name: fullName,
        status: UserStatus.Onboarding_UnPaid,
      },
    });

    return newUser;
  }

  async recordUserSession(userId: string, userAgent: UserAgent): Promise<void> {
    if (!userId) {
      throw new ValidationError('Cannot Record User Session: Id is null or empty');
    }

    await this.client.userSession.create({
      data: {
        userId,
        deviceType: userAgent.deviceType,
        operatingSystem: userAgent.operatingSystem,
        sessionIpAddress: userAgent.sessionIpAddress,
        sessionType: userAgent.sessionType,
      },
    });
  }

  async deleteUserById(userId: string): Promise<void> {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Delete User By Id: Id is null or empty');
    }

    await this.client.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

export const userRepository = new UserRepository();
