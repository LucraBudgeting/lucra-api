import { UserPreferences } from '@prisma/client';
import { BaseRepository } from './base.repository';

class UserPreferencesRepository extends BaseRepository {
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.client.userPreferences.findFirst({
      where: {
        userId,
      },
    });
  }
}

export const userPreferencesRepository = new UserPreferencesRepository();
