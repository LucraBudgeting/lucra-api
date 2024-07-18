export interface Condition {
  field: string;
  operator: conditionOperator;
  value: any;
}

export interface ConditionGroup {
  type: conditionType;
  conditions: (Condition | ConditionGroup)[];
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
