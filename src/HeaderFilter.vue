<template>
  <div class="naive-gridfilter" @click.stop @mousedown.stop>
    <n-form :show-feedback="false" label-placement="left" label-width="64" size="small">
      <template v-if="resolvedType === 'date'">
        <n-form-item>
          <n-select v-model:value="dateOps.start" :options="dateOpOptions" :style="controlStyle" />
        </n-form-item>
        <n-form-item>
          <n-date-picker
            v-model:value="dateValues.start"
            type="date"
            :style="controlStyle"
            @click.stop
            @focus.stop
            @blur.stop
          />
        </n-form-item>
        <n-form-item>
          <n-select v-model:value="dateOps.end" :options="dateOpOptions" :style="controlStyle" />
        </n-form-item>
        <n-form-item>
          <n-date-picker
            v-model:value="dateValues.end"
            type="date"
            :style="controlStyle"
            @click.stop
            @focus.stop
            @blur.stop
          />
        </n-form-item>
      </template>

      <template v-else-if="resolvedType === 'number'">
        <n-form-item>
          <n-select v-model:value="state.op" :options="numberOpOptions" :style="controlStyle" />
        </n-form-item>
        <n-form-item>
          <n-input-number
            v-model:value="numberValue"
            :precision="0"
            :min="minNumber"
            :max="maxNumber"
            :style="controlStyle"
          />
        </n-form-item>
      </template>

      <template v-else-if="resolvedType === 'text'">
        <n-form-item>
          <n-select v-model:value="state.op" :options="textOpOptions" :style="controlStyle" />
        </n-form-item>
        <n-form-item>
          <n-input v-model:value="textValue" clearable :placeholder="placeholder" :style="controlStyle" />
        </n-form-item>
      </template>

      <template v-else-if="resolvedType === 'select' || resolvedType === 'combobox'">
        <n-form-item>
          <n-select v-model:value="state.op" :options="eqOptions" :style="controlStyle" />
        </n-form-item>
        <n-form-item>
          <n-select
            v-model:value="selectValue"
            :options="selectOptions"
            :loading="loading"
            clearable
            filterable
            :placeholder="selectPlaceholder"
            :style="controlStyle"
            @search="loadOptions"
          />
        </n-form-item>
      </template>

      <template v-else-if="resolvedType === 'boolean'">
        <n-form-item>
          <n-select
            v-model:value="booleanValue"
            :options="booleanOptions"
            clearable
            :placeholder="selectPlaceholder"
            :style="controlStyle"
          />
        </n-form-item>
      </template>

      <template v-else-if="resolvedType === 'combotree'">
        <n-form-item>
          <n-tree-select
            v-model:value="treeValue"
            :options="treeOptions"
            :loading="loading"
            multiple
            cascade
            checkable
            clearable
            :placeholder="selectPlaceholder"
            :style="controlStyle"
          />
        </n-form-item>
      </template>

      <n-space justify="center" :size="12">
        <n-button size="small" quaternary @click="handleClear">{{ clearText }}</n-button>
        <n-button size="small" type="primary" @click="handleApply">{{ applyText }}</n-button>
      </n-space>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NTreeSelect,
} from 'naive-ui';
import { createEmptyFilterValue, defaultFilterOp } from './filterRules';
import type { SelectOption, TreeSelectOption } from 'naive-ui';
import type { GridFilterOption, GridFilterType, GridFilterValue, RemoteFilterSourceResult } from './types';

type SelectValue = string | number | boolean | null;
type TreeValue = string | number | Array<string | number> | null;

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    label?: string;
    type?: GridFilterType;
    modelValue?: GridFilterValue;
    options?: GridFilterOption[];
    fetchOptions?: (query?: string) => Promise<GridFilterOption[] | RemoteFilterSourceResult>;
    minNumber?: number;
    maxNumber?: number;
    dateOnly?: boolean;
    width?: string | number;
    placeholder?: string;
    selectPlaceholder?: string;
    applyText?: string;
    clearText?: string;
  }>(),
  {
    type: 'text',
    options: () => [],
    minNumber: Number.MIN_SAFE_INTEGER,
    maxNumber: Number.MAX_SAFE_INTEGER,
    width: 260,
    placeholder: '请输入',
    selectPlaceholder: '请选择',
    applyText: '过滤',
    clearText: '清除',
  }
);

const emit = defineEmits<{
  apply: [filter: GridFilterValue];
  clear: [filter: GridFilterValue];
  'update:modelValue': [filter: GridFilterValue];
}>();

const resolvedType = computed(() => props.type);
const loading = ref(false);
const selectOptions = ref<SelectOption[]>(props.options as SelectOption[]);
const treeOptions = ref<TreeSelectOption[]>(props.options as unknown as TreeSelectOption[]);

const state = reactive<{ op: string; value: SelectValue | TreeValue }>({
  op: props.modelValue?.op ?? defaultFilterOp(props.type),
  value: normalizeControlValue(props.modelValue?.value),
});

const dateOps = reactive({
  start: props.modelValue?.dateOps?.start ?? 'gte',
  end: props.modelValue?.dateOps?.end ?? 'lte',
});

const dateValues = reactive<{ start: number | null; end: number | null }>({
  start: Array.isArray(props.modelValue?.value) ? normalizeDateValue(props.modelValue?.value[0]) : null,
  end: Array.isArray(props.modelValue?.value) ? normalizeDateValue(props.modelValue?.value[1]) : null,
});

const controlStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}));

const minNumber = computed(() => props.minNumber);
const maxNumber = computed(() => props.maxNumber);
const numberValue = computed<number | null>({
  get: () => (typeof state.value === 'number' ? state.value : null),
  set: (value) => {
    state.value = value;
  },
});
const textValue = computed<string | null>({
  get: () => (typeof state.value === 'string' ? state.value : null),
  set: (value) => {
    state.value = value;
  },
});
const selectValue = computed<string | number | null>({
  get: () => (typeof state.value === 'string' || typeof state.value === 'number' ? state.value : null),
  set: (value) => {
    state.value = value;
  },
});
const booleanValue = computed<any>({
  get: () => state.value,
  set: (value) => {
    state.value = value;
  },
});
const treeValue = computed<TreeValue>({
  get: () => {
    if (Array.isArray(state.value)) return state.value;
    if (typeof state.value === 'string' || typeof state.value === 'number') return state.value;
    return null;
  },
  set: (value) => {
    state.value = value;
  },
});

const textOpOptions = [
  { label: '包含', value: 'icontains' },
  { label: '等于', value: 'exact' },
  { label: '开头是', value: 'istartswith' },
  { label: '结尾是', value: 'iendswith' },
];
const numberOpOptions = [
  { label: '等于', value: 'exact' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
];
const dateOpOptions = [
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
];
const eqOptions = [
  { label: '等于', value: 'exact' },
  { label: '不等于', value: 'not_eq' },
];
const booleanOptions = computed<any[]>(() =>
  props.options.length
    ? (props.options as unknown as SelectOption[])
    : [
        { label: '启用', value: true },
        { label: '禁用', value: false },
      ]
);

watch(
  () => props.modelValue,
  (value) => {
    const next = value ?? createEmptyFilterValue(props.type);
    state.op = next.op;
    state.value = normalizeControlValue(next.value);
    if (next.type === 'date' && Array.isArray(next.value)) {
      dateValues.start = normalizeDateValue(next.value[0]);
      dateValues.end = normalizeDateValue(next.value[1]);
      dateOps.start = next.dateOps?.start ?? 'gte';
      dateOps.end = next.dateOps?.end ?? 'lte';
    }
  }
);

onMounted(() => {
  if (props.fetchOptions && ['select', 'combobox', 'combotree'].includes(props.type)) {
    void loadOptions();
  }
});

async function loadOptions(query?: string) {
  if (!props.fetchOptions) return;
  loading.value = true;
  try {
    const result = await props.fetchOptions(query);
    const nextOptions = Array.isArray(result) ? result : result.options ?? result.tree ?? [];
    if (props.type === 'combotree') {
      treeOptions.value = nextOptions as unknown as TreeSelectOption[];
    } else {
      selectOptions.value = nextOptions as SelectOption[];
    }
  } finally {
    loading.value = false;
  }
}

function handleApply() {
  const filter = toFilterValue();
  emit('update:modelValue', filter);
  emit('apply', filter);
}

function handleClear() {
  state.value = null;
  dateValues.start = null;
  dateValues.end = null;
  const filter = createEmptyFilterValue(props.type);
  emit('update:modelValue', filter);
  emit('clear', filter);
}

function toFilterValue(): GridFilterValue {
  if (props.type === 'date') {
    return {
      op: 'range',
      value: [dateValues.start, dateValues.end],
      type: 'date',
      dateOps: { ...dateOps },
    };
  }

  return {
    op: props.type === 'combotree' ? 'in' : state.op,
    value: state.value,
    type: props.type,
  };
}

function normalizeControlValue(value: unknown): SelectValue | TreeValue {
  if (Array.isArray(value)) {
    return value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number');
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return null;
}

function normalizeDateValue(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }
  return null;
}
</script>

<style scoped>
.naive-gridfilter {
  padding: 12px;
  min-width: calc(260px + 24px);
}

.naive-gridfilter :deep(.n-form-item) {
  margin-bottom: 10px;
}

.naive-gridfilter :deep(.n-space) {
  margin-top: 8px;
}
</style>
