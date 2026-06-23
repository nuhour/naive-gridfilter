import { h } from 'vue';
import HeaderFilter from './HeaderFilter.vue';
import { buildFilterRules, createEmptyFilterValue } from './filterRules';
import type {
  CreateFilterColumnOptions,
  FilterableColumn,
  GridFilterConfig,
  GridFilterState,
  GridFilterType,
  GridFilterValue,
} from './types';

export function createFilterColumn<T = Record<string, unknown>>(
  column: FilterableColumn<T>,
  config?: GridFilterConfig | GridFilterType | true,
  options: CreateFilterColumnOptions = {}
): FilterableColumn<T> {
  const filterConfig = normalizeFilterConfig(column, config ?? column.gridFilter);
  if (!filterConfig) return column;

  const fieldKey = filterConfig.fieldKey ?? String(column.key ?? '');
  const currentFilters = options.filters ?? {};

  return {
    ...column,
    filter: true,
    filterMultiple: false,
    renderFilterMenu: ({ hide }) =>
      h(HeaderFilter, {
        ...filterConfig,
        fieldKey,
        label: filterConfig.label ?? titleToLabel(column.title),
        modelValue: currentFilters[fieldKey] ?? createEmptyFilterValue(filterConfig.type ?? 'text'),
        onApply: (filter: GridFilterValue) => {
          const nextFilters: GridFilterState = {
            ...currentFilters,
            [fieldKey]: filter,
          };
          options.onFilterChange?.(nextFilters, buildFilterRules(nextFilters));
          hide?.();
        },
        onClear: () => {
          const nextFilters: GridFilterState = {
            ...currentFilters,
            [fieldKey]: createEmptyFilterValue(filterConfig.type ?? 'text'),
          };
          options.onFilterChange?.(nextFilters, buildFilterRules(nextFilters));
          hide?.();
        },
      }),
  };
}

export function createFilterColumns<T = Record<string, unknown>>(
  columns: Array<FilterableColumn<T>>,
  options: CreateFilterColumnOptions = {}
): Array<FilterableColumn<T>> {
  return columns.map((column) => createFilterColumn(column, column.gridFilter, options));
}

function normalizeFilterConfig<T>(
  column: FilterableColumn<T>,
  config?: GridFilterConfig | GridFilterType | true
): GridFilterConfig | null {
  if (!config) return null;
  if (config === true) {
    return {
      type: 'text',
      fieldKey: String(column.key ?? ''),
      label: titleToLabel(column.title),
    };
  }
  if (typeof config === 'string') {
    return {
      type: config,
      fieldKey: String(column.key ?? ''),
      label: titleToLabel(column.title),
    };
  }
  return {
    type: 'text',
    fieldKey: String(column.key ?? ''),
    label: titleToLabel(column.title),
    ...config,
  };
}

function titleToLabel(title: unknown): string {
  return typeof title === 'string' ? title : '';
}
