import { BaseRepository } from './base.repository';

class UserFeedbackRepository extends BaseRepository {
  async create(userId: string, feedback: string): Promise<void> {
    await this.client.userFeedback.create({
      data: {
        feedback,
        userId,
      },
    });
  }
}

export const userFeedbackRepository = new UserFeedbackRepository();
