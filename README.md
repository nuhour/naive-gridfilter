# naive-gridfilter

Config-driven advanced filters for [Naive UI](https://www.naiveui.com/) data tables.

`naive-gridfilter` extracts a reusable version of a production table header filter pattern: you describe each column's filter type in configuration, and the package renders a Naive UI filter menu plus normalized `filterRules` for remote APIs.

## Install

```bash
npm install naive-gridfilter
```

Peer dependencies:

```bash
npm install vue naive-ui
```

## Basic Usage

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { NDataTable } from 'naive-ui';
import {
  buildFilterRules,
  createFilterColumns,
  type GridFilterState,
} from 'naive-gridfilter';
import 'naive-gridfilter/style.css';

const filters = ref<GridFilterState>({});

const columns = computed(() =>
  createFilterColumns(
    [
      {
        title: 'ID',
        key: 'id',
        sorter: true,
        gridFilter: { type: 'number', minNumber: 1 },
      },
      {
        title: 'Name',
        key: 'name',
        gridFilter: 'text',
      },
      {
        title: 'Status',
        key: 'status',
        gridFilter: {
          type: 'select',
          options: [
            { label: 'Enabled', value: 1 },
            { label: 'Disabled', value: 0 },
          ],
        },
      },
      {
        title: 'Updated At',
        key: 'updated_at',
        gridFilter: { type: 'date' },
      },
    ],
    {
      filters: filters.value,
      onFilterChange(nextFilters, rules) {
        filters.value = nextFilters;
        loadData({ page: 1, filterRules: rules });
      },
    }
  )
);

async function loadData(params = {}) {
  const filterRules = buildFilterRules(filters.value);
  // await api.list({ ...params, filterRules });
}
</script>

<template>
  <n-data-table remote :columns="columns" />
</template>
```

## Output Format

`buildFilterRules()` returns a backend-friendly array:

```ts
[
  { field: 'name', op: 'icontains', ig: false, value: 'Li', type: 'text' },
  { field: 'id', op: 'gte', ig: false, value: 10, type: 'number' },
  { field: 'updated_at', op: 'gte', ig: false, value: '2025-01-02 00:00:00', type: 'date' },
  { field: 'updated_at', op: 'lte', ig: false, value: '2025-01-31 00:00:00', type: 'date' },
];
```

Date range filters expand into two independent rules. `false` and `0` are preserved as valid filter values.

## Filter Types

- `text`: contains, equals, starts with, ends with
- `number`: equals, greater than, greater than or equal, less than, less than or equal
- `date`: start/end date with independent operators
- `select`: static or async options
- `combobox`: searchable select
- `boolean`: true/false select
- `combotree`: multiple tree select, emitted with `in`

## Async Options

```ts
{
  title: 'Owner',
  key: 'owner_id',
  gridFilter: {
    type: 'select',
    async fetchOptions(query) {
      const res = await fetch(`/api/users?q=${query ?? ''}`);
      const users = await res.json();
      return users.map((user) => ({ label: user.name, value: user.id }));
    },
  },
}
```

## Direct Component Usage

```vue
<HeaderFilter
  field-key="name"
  type="text"
  :model-value="filters.name"
  @apply="(filter) => (filters.name = filter)"
/>
```

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

## License

MIT
