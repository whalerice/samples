<template>
  <a-row class="search-filter-box" :gutter="[0, 6]">
    <FilterOutlined />

    <template v-for="(data, key) in value">
      <template v-if="data">
        <template v-if="types[key] === 'select'">
          <a-col v-for="item in data" :key="`${key}_${item}`">
            <a-tag closable @close="deleteValue(key, item)">
              {{ $t(getLabel(key)) }} :
              <template
                v-if="key === 'investmentStep' || key === 'memberLevel'"
              >
                {{ getValue(key, item)() }}
              </template>
              <template v-else>
                {{ $t(getValue(key, item)) }}
              </template>
            </a-tag>
          </a-col>
        </template>

        <template v-else>
          <a-col v-if="data" :key="key">
            <template v-if="types[key] === 'date'">
              <a-tag closable @close="deleteValue(key)">
                {{ $t(getLabel(key)) }} : {{ data[0].format('YYYY-MM-DD') }} ~
                {{ data[1].format('YYYY-MM-DD') }}
              </a-tag>
            </template>

            <template v-if="types[key] === 'search'">
              <a-tag closable @close="deleteValue(key)">
                {{ $t(getLabel(key)) }} :
                {{ data }}
              </a-tag>
            </template>
          </a-col>
        </template>
      </template>
    </template>
  </a-row>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { FilterOutlined } from '@ant-design/icons-vue';

const emits = defineEmits(['update:value']);

const props = defineProps({
  filters: Array as PropType<IFilter[]>,
  value: {
    type: Object,
    required: true,
  },
});

const value = computed({
  get: () => props.value,
  set: (value: any) => {
    emits('update:value', value);
  },
});

const types = computed<Record<string, string>>(
  () =>
    props.filters?.reduce(
      (result, current) => ({ ...result, [current.id]: current.type }),
      {}
    ) ?? {}
);

const getLabel = (key: string) => {
  if (!props.filters) {
    return '';
  }

  const filter = props.filters.find((e) => e.id === key);
  if (!filter) {
    return '';
  }

  return filter.label;
};

const getValue = (key: string, data: any) => {
  if (!props.filters) {
    return '';
  }

  const filter = props.filters.find((e) => e.id === key);
  if (!filter) {
    return '';
  }

  return filter.options?.find((e) => e.value === data).label;
};

const deleteValue = (key: string, item?: any) => {
  if (item !== undefined) {
    value.value = {
      ...value.value,
      [key]: value.value[key].filter((e: any) => e !== item),
    };

    return;
  }

  value.value = {
    ...value.value,
    [key]: undefined,
  };
};
</script>
