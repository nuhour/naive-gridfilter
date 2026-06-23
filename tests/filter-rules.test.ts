import { describe, expect, it } from 'vitest';
import {
  buildFilterRules,
  createEmptyFilterValue,
  defaultFilterOp,
  hasFilterValue,
} from '../src';

describe('filter rule helpers', () => {
  it('builds text, number, boolean and combotree filter rules', () => {
    expect(
      buildFilterRules({
        name: { op: 'icontains', value: 'Li', type: 'text' },
        id: { op: 'gte', value: 10, type: 'number' },
        enabled: { op: 'exact', value: false, type: 'boolean' },
        departmentIds: { op: 'in', value: [1, 2], type: 'combotree' },
        emptyText: { op: 'exact', value: '', type: 'text' },
      })
    ).toEqual([
      { field: 'name', op: 'icontains', ig: false, value: 'Li', type: 'text' },
      { field: 'id', op: 'gte', ig: false, value: 10, type: 'number' },
      { field: 'enabled', op: 'exact', ig: false, value: false, type: 'boolean' },
      { field: 'departmentIds', op: 'in', ig: false, value: [1, 2], type: 'combotree' },
    ]);
  });

  it('expands date range filters into two independent rules', () => {
    expect(
      buildFilterRules(
        {
          createdAt: {
            op: 'range',
            value: [new Date('2025-01-02T03:04:05'), '2025-02-03 04:05:06'],
            type: 'date',
            dateOps: { start: 'gte', end: 'lt' },
          },
        },
        { dateOnly: false }
      )
    ).toEqual([
      { field: 'createdAt', op: 'gte', ig: false, value: '2025-01-02 03:04:05', type: 'date' },
      { field: 'createdAt', op: 'lt', ig: false, value: '2025-02-03 04:05:06', type: 'date' },
    ]);
  });

  it('detects active filters without dropping false or zero', () => {
    expect(hasFilterValue({ op: 'exact', value: false, type: 'boolean' })).toBe(true);
    expect(hasFilterValue({ op: 'exact', value: 0, type: 'number' })).toBe(true);
    expect(hasFilterValue({ op: 'exact', value: '', type: 'text' })).toBe(false);
    expect(hasFilterValue({ op: 'range', value: [null, null], type: 'date' })).toBe(false);
  });

  it('creates empty filter values with sensible default operators', () => {
    expect(defaultFilterOp('text')).toBe('icontains');
    expect(defaultFilterOp('date')).toBe('gte');
    expect(createEmptyFilterValue('number')).toEqual({ op: 'exact', value: null, type: 'number' });
  });
});
