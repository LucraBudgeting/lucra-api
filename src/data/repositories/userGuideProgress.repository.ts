import { UserGuideProgress } from '@prisma/client';
import { BaseRepository } from './base.repository';

class UserGuideProgressRepository extends BaseRepository {
  async getGuideProgress(userId: string): Promise<UserGuideProgress[]> {
    return this.client.userGuideProgress.findMany({
      where: {
        userId,
      },
    });
  }

  async completeGuide(userId: string, guideId: string) {
    await this.client.userGuideProgress.upsert({
      where: {
        userId_guideId: {
          userId: userId,
          guideId: guideId,
        },
      },
      update: {
        progress: 1,
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        guideId: guideId,
        progress: 1,
        completed: true,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });
  }
}

export const userGuideProgressRepository = new UserGuideProgressRepository();
