import { Rule, RuleModels } from '@prisma/client';

export interface IRule extends Rule {}

export interface IPutRule {
  model: RuleModels;
  conditions: string;
  name: string;
}

export interface IPutRuleRequest<TCondition> {
  id?: string;
  name: string;
  rule: TCondition;
}
