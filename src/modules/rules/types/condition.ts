export interface ICondition {
  field: string;
  operator: conditionOperator;
  value: any;
}

export interface IConditionGroup {
  type: conditionType;
  conditions: ICondition[];
}

export enum conditionOperator {
  contains = 'contains',
  equals = 'equals',
  starts_with = 'starts_with',
  ends_with = 'ends_with',
}

export enum conditionType {
  and = 'and',
  or = 'or',
}
