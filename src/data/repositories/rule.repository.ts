import { RuleModels } from '@prisma/client';
import { IPutRule, IRule } from '@/modules/rules/types/rule';
import { BaseRepository } from './base.repository';

class RuleRepository extends BaseRepository {
  async getTransactionRules(userId: string): Promise<IRule[]> {
    return await this.client.rule.findMany({
      where: {
        userId,
        model: RuleModels.Transaction,
      },
    });
  }

  async createRule(newRule: IPutRule): Promise<IRule> {
    return await this.client.rule.create({
      data: {
        userId: newRule.userId,
        model: newRule.model,
        name: newRule.name,
        conditions: newRule.conditions,
      },
    });
  }

  async deleteRule(userId: string, ruleId: string): Promise<void> {
    await this.client.rule.delete({
      where: {
        userId,
        id: ruleId,
      },
    });
  }

  async updateRule(userId: string, ruleId: string, updatedRule: IPutRule): Promise<IRule> {
    return await this.client.rule.update({
      where: {
        userId,
        id: ruleId,
      },
      data: {
        name: updatedRule.name,
        conditions: updatedRule.conditions,
      },
    });
  }
}

export const ruleRepository = new RuleRepository();
