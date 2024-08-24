import { Guide, User } from '@/data/db.client';
import { guideRepository } from '@/data/repositories/guide.repository';
import { userGuideProgressRepository } from '@/data/repositories/userGuideProgress.repository';
import { UserProgressDto } from './types/UserProgressDto';

export class UserGuideService {
  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  async getUserGuides(): Promise<{ progress: Record<string, UserProgressDto>; guides: Guide[] }> {
    const guides = await guideRepository.getAllGuides();
    const guideProgressMap = guides.reduce(
      (acc, guide) => {
        acc[guide.id] = {} as UserProgressDto;
        return acc;
      },
      {} as Record<string, UserProgressDto>
    );

    const userProgress = await userGuideProgressRepository.getGuideProgress(this.user.id);

    userProgress.forEach((progress) => {
      guideProgressMap[progress.guideId] = new UserProgressDto(progress);
    });

    return { progress: guideProgressMap, guides };
  }

  async completeGuide(guideId: string) {
    await userGuideProgressRepository.completeGuide(this.user.id, guideId);
  }
}
