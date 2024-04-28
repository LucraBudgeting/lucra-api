import { UserAuth } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { ValidationError } from "@/exceptions/error";

type UserAuthResponse = UserAuth | null;

class UserAuthRepository extends BaseRepository {
  async findAuthByUserId(userId: string): Promise<UserAuthResponse> {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError(
        "Cannot Find Auth By User Id: User Id is null or empty"
      );
    }

    return this.client.userAuth.findFirst({
      where: {
        userId,
      },
    });
  }
}

export const userAuthRepository = new UserAuthRepository();
