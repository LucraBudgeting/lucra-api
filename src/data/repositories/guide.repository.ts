import { Guide } from '@prisma/client';
import { BaseRepository } from './base.repository';

class GuideRepository extends BaseRepository {
  async getAllGuides(): Promise<Guide[]> {
    return this.client.guide.findMany();
  }
}

export const guideRepository = new GuideRepository();
