import type {
  BuildFilterRulesOptions,
  GridFilterRule,
  GridFilterState,
  GridFilterType,
  GridFilterValue,
} from './types';

export function defaultFilterOp(type: GridFilterType): string {
  if (type === 'text') return 'icontains';
  if (type === 'date') return 'gte';
  if (type === 'combotree') return 'in';
  return 'exact';
}

export function createEmptyFilterValue(type: GridFilterType): GridFilterValue {
  return {
    op: defaultFilterOp(type),
    value: null,
    type,
  };
}

export function hasFilterValue(filter?: GridFilterValue | null): boolean {
  if (!filter) return false;
  if (filter.type === 'date' && filter.op === 'range') {
    return Array.isArray(filter.value) && filter.value.some(isPresent);
  }
  if (filter.type === 'combotree') {
    return Array.isArray(filter.value) && filter.value.length > 0;
  }
  return isPresent(filter.value);
}

export function buildFilterRules(
  filters: GridFilterState,
  options: BuildFilterRulesOptions = {}
): GridFilterRule[] {
  const rules: GridFilterRule[] = [];
  const formatter = options.dateFormatter ?? formatFilterDate;
  const ig = options.ignoreCase ?? false;

  Object.entries(filters).forEach(([field, filter]) => {
    if (!hasFilterValue(filter)) return;

    if (filter.type === 'date' && filter.op === 'range' && Array.isArray(filter.value)) {
      const [start, end] = filter.value;
      if (isPresent(start)) {
        rules.push({
          field,
          op: filter.dateOps?.start ?? 'gte',
          ig,
          value: formatter(start, options.dateOnly ?? false),
          type: 'date',
        });
      }
      if (isPresent(end)) {
        rules.push({
          field,
          op: filter.dateOps?.end ?? 'lte',
          ig,
          value: formatter(end, options.dateOnly ?? false),
          type: 'date',
        });
      }
      return;
    }

    rules.push({
      field,
      op: filter.type === 'combotree' ? 'in' : filter.op,
      ig,
      value: filter.value,
      type: filter.type,
    });
  });

  return rules;
}

export function formatFilterDate(value: unknown, dateOnly = false): string {
  if (typeof value === 'string') {
    const normalized = value.replace('T', ' ').replace(/\.\d{3}Z$/, '');
    return dateOnly ? normalized.slice(0, 10) : normalized.slice(0, 19);
  }

  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return String(value);

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  if (dateOnly) return `${year}-${month}-${day}`;

  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
