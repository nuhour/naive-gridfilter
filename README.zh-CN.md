# naive-gridfilter

[English](./README.md) | [简体中文](./README.zh-CN.md)

面向 [Naive UI](https://www.naiveui.com/) `n-data-table` 的配置式高级表格过滤组件。

`naive-gridfilter` 把一个生产项目中的表头过滤模式抽象成可复用 npm 包：你只需要在表格列配置里声明过滤类型，它会自动渲染 Naive UI 表头过滤菜单，并输出适合远程接口使用的标准 `filterRules`。

## 安装

```bash
npm install naive-gridfilter
```

Peer dependencies:

```bash
npm install vue naive-ui
```

## 快速使用

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
        title: '名称',
        key: 'name',
        gridFilter: 'text',
      },
      {
        title: '状态',
        key: 'status',
        gridFilter: {
          type: 'select',
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        },
      },
      {
        title: '更新时间',
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

## 列配置

给 Naive UI 表格列增加 `gridFilter` 即可：

```ts
const columns = createFilterColumns([
  { title: '名称', key: 'name', gridFilter: 'text' },
  { title: 'ID', key: 'id', gridFilter: { type: 'number', minNumber: 1 } },
  {
    title: '状态',
    key: 'status',
    gridFilter: {
      type: 'select',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
]);
```

## 输出格式

`buildFilterRules()` 会输出适合后端接口接收的数组：

```ts
[
  { field: 'name', op: 'icontains', ig: false, value: 'Li', type: 'text' },
  { field: 'id', op: 'gte', ig: false, value: 10, type: 'number' },
  { field: 'updated_at', op: 'gte', ig: false, value: '2025-01-02 00:00:00', type: 'date' },
  { field: 'updated_at', op: 'lte', ig: false, value: '2025-01-31 00:00:00', type: 'date' },
];
```

日期范围会展开成两条独立规则。`false` 和 `0` 会被保留为有效过滤值，不会被误判为空。

## 支持的过滤类型

- `text`: 包含、等于、开头是、结尾是
- `number`: 等于、大于、大于等于、小于、小于等于
- `date`: 起止日期，并支持独立操作符
- `select`: 静态或异步选项
- `combobox`: 可搜索下拉
- `boolean`: 布尔下拉
- `combotree`: 多选树，下发操作符为 `in`

## 异步选项

```ts
{
  title: '负责人',
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

## 直接使用组件

```vue
<HeaderFilter
  field-key="name"
  type="text"
  :model-value="filters.name"
  @apply="(filter) => (filters.name = filter)"
/>
```

## 开发

```bash
npm install
npm test
npm run typecheck
npm run build
```

## 发布到 npm

```bash
npm publish
```

如果是 scoped public package，使用：

```bash
npm publish --access public
```

## License

MIT
