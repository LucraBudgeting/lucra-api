import { AccountAccess } from '@prisma/client';
import { NotFoundError, ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class AccountAccessRepository extends BaseRepository {
  async createPlaidAccountAccess(userId: string, accessToken: string, itemId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('User ID is required to create plaid account access');
    }
    if (accessToken.isNullOrEmpty()) {
      throw new ValidationError('Access token is required to create plaid account access');
    }

    return this.client.accountAccess.create({
      data: {
        userId,
        accessToken,
        providerItemId: itemId,
      },
    });
  }

  async doesUserAlreadyHaveInstitution(userId: string, institutionId: string): Promise<boolean> {
    const result = await this.client.accountAccess.findMany({
      where: {
        userId,
        account: {
          some: {
            institutionId,
          },
        },
      },
    });

    return result.length > 0;
  }

  async getAccountAccessByItemId(itemId: string) {
    const access = await this.client.accountAccess.findFirst({
      where: {
        providerItemId: itemId,
      },
      include: {
        account: true,
      },
    });

    if (!access) {
      throw new NotFoundError(`Plaid Account Access not found: ${itemId}`);
    }

    return access;
  }

  async getAccountAccessByUserId(userId: string): Promise<AccountAccess[]> {
    const access = await this.client.accountAccess.findMany({
      where: {
        userId,
      },
      include: {
        account: true,
      },
    });

    return access;
  }
}

export const accountAccessRepository = new AccountAccessRepository();
