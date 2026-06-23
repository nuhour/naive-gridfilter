import type { DataTableBaseColumn } from 'naive-ui';

export type GridFilterType = 'text' | 'select' | 'boolean' | 'number' | 'date' | 'combotree' | 'combobox';

export type GridFilterOperator =
  | 'icontains'
  | 'exact'
  | 'istartswith'
  | 'iendswith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'not_eq'
  | 'in'
  | 'range'
  | string;

export interface GridFilterOption {
  label: string;
  value: string | number | boolean;
  children?: GridFilterOption[];
}

export interface GridFilterValue {
  op: GridFilterOperator;
  value: unknown;
  type: GridFilterType;
  dateOps?: {
    start: GridFilterOperator;
    end: GridFilterOperator;
  };
}

export type GridFilterState = Record<string, GridFilterValue>;

export interface GridFilterRule {
  field: string;
  op: GridFilterOperator;
  ig: boolean;
  value: unknown;
  type: GridFilterType;
}

export interface BuildFilterRulesOptions {
  dateOnly?: boolean;
  ignoreCase?: boolean;
  dateFormatter?: (value: unknown, dateOnly: boolean) => string;
}

export interface RemoteFilterSourceResult {
  options?: GridFilterOption[];
  tree?: GridFilterOption[];
}

export interface GridFilterConfig {
  fieldKey?: string;
  label?: string;
  type?: GridFilterType;
  options?: GridFilterOption[];
  fetchOptions?: (query?: string) => Promise<GridFilterOption[] | RemoteFilterSourceResult>;
  minNumber?: number;
  maxNumber?: number;
  dateOnly?: boolean;
  width?: string | number;
}

export type FilterableColumn<T = Record<string, unknown>> = DataTableBaseColumn<T> & {
  gridFilter?: GridFilterConfig | GridFilterType | true;
};

export interface CreateFilterColumnOptions {
  filters?: GridFilterState;
  onFilterChange?: (filters: GridFilterState, rules: GridFilterRule[]) => void;
}
