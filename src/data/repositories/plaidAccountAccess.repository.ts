import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';
import { PlaidAccount } from '@prisma/client';

class PlaidAccountAccessRepository extends BaseRepository {
  async createPlaidAccountAccess(userId: string, accessToken: string, itemId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('User ID is required to create plaid account access');
    }
    if (accessToken.isNullOrEmpty()) {
      throw new ValidationError('Access token is required to create plaid account access');
    }

    return this.client.plaidAccountAccess.create({
      data: {
        userId,
        accessToken,
        itemId,
      },
    });
  }

  async doesUserAlreadyHaveInstitution(userId: string, institutionId: string): Promise<boolean> {
    const result = await this.client.plaidAccountAccess.findMany({
      where: {
        userId,
        PlaidAccount: {
          some: {
            institutionId,
          },
        },
      },
    });

    return result.length > 0;
  }
}

export const plaidAccountAccessRepository = new PlaidAccountAccessRepository();
