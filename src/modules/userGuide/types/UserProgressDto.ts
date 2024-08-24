import { UserGuideProgress } from '@prisma/client';

export class UserProgressDto {
  completed: boolean = false;
  guideId: string = '';
  progress: number = 0;

  constructor(data: UserGuideProgress) {
    this.completed = data.completed;
    this.guideId = data.guideId;
    this.progress = data.progress;
  }
}
