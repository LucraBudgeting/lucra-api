import { ValidationError } from '@/exceptions/error';
import { BaseRepository } from './base.repository';

class UserOnboardingStageRepository extends BaseRepository {
  async createUser(userId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError(
        'Cannot Create Onboarding User By User Id: User Id is null or empty'
      );
    }

    return this.client.userOnboardingStage.create({
      data: {
        userId,
      },
    });
  }

  async findUserByUserId(userId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Find Onboarding User By User Id: User Id is null or empty');
    }

    return this.client.userOnboardingStage.findFirst({
      where: {
        userId,
      },
    });
  }

  async markBillingConnected(userId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Mark Payment Connected: User Id is null or empty');
    }

    return this.client.userOnboardingStage.update({
      where: {
        userId,
      },
      data: {
        isBillingConnected: true,
      },
    });
  }

  async markBankingAccountConnected(userId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Mark Banking Account Connected: User Id is null or empty');
    }

    return this.client.userOnboardingStage.update({
      where: {
        userId,
      },
      data: {
        hasBankingAccountConnected: true,
      },
    });
  }

  async markBudgetCreated(userId: string) {
    if (userId.isNullOrEmpty()) {
      throw new ValidationError('Cannot Mark Budget Created: User Id is null or empty');
    }

    return this.client.userOnboardingStage.update({
      where: {
        userId,
      },
      data: {
        hasCreatedBudget: true,
      },
    });
  }
}

export const userOnboardingStageRepository = new UserOnboardingStageRepository();
