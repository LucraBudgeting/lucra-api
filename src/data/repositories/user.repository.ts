import { ValidationError } from "@/exceptions/error";
import { BaseRepository } from "./base.repository";
import { User } from "@prisma/client";

type UserResponse = User | null;

class UserRepository extends BaseRepository {
  async findUserByEmail(email: string): Promise<UserResponse> {
    if (!email.isValidEmail()) {
      throw new ValidationError(
        "Cannot Find User By Email: Invalid email address"
      );
    }

    return this.client.user.findFirst({
      where: {
        email,
      },
    });
  }

  async findUserByUsername(username: string): Promise<UserResponse> {
    if (username.isNullOrEmpty()) {
      throw new ValidationError(
        "Cannot Find User By Username: Username is null or empty"
      );
    }

    return this.client.user.findFirst({
      where: {
        username,
      },
    });
  }

  async findUserById(id: string): Promise<UserResponse> {
    if (id.isNullOrEmpty()) {
      throw new ValidationError("Cannot Find User By Id: Id is null or empty");
    }

    return this.client.user.findFirst({
      where: {
        id,
      },
    });
  }
}

export const userRepository = new UserRepository();
