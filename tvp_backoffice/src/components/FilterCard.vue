<template>
  <a-card class="gap-sm">
    <a-row :gutter="[5, 5]">
      <a-col v-for="data in props.filters" :key="data.id">
        <DateRangePicker
          v-if="data.type === 'date'"
          :id="data.id"
          :label="data.label"
          v-model:value="value"
        />

        <MultipleSelect
          v-if="data.type === 'select' && data.options"
          :id="data.id"
          :label="data.label"
          :options="data.options"
          :search="data.search"
          v-model:value="value"
        />

        <SearchInput
          v-if="data.type === 'search'"
          :id="data.id"
          :label="data.label"
          v-model:value="value"
        />
      </a-col>

      <a-col>
        <a-button type="search" @click="search">
          <template #icon><SearchOutlined /></template>
          {{ $t('common.word.search') }}
        </a-button>
      </a-col>
    </a-row>

    <SelectTagsContainer :filters="filters" v-model:value="value" />
  </a-card>
</template>

<script setup lang="ts">
import DateRangePicker from '@/components/DateRangePicker.vue';
import MultipleSelect from '@/components/select/MultipleSelect.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectTagsContainer from '@/components/SelectTagsContainer.vue';
import { ref, PropType } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const value = ref<Record<string, any>>({});

const props = defineProps({
  filters: Array as PropType<IFilter[]>,
});

const emits = defineEmits(['search']);

const search = () => {
  const filters = Object.keys(value.value).reduce<any>((result, key) => {
    const item = props.filters!.find((e) => e.id == key);
    let current = value.value[key];

    switch (item?.type) {
      case 'date':
        current = current && {
          start: current[0].format('YYYY-MM-DD'),
          end: current[1].format('YYYY-MM-DD'),
        };
        break;
    }

    return {
      ...result,
      [key]: current,
    };
  }, {});

  emits('search', { ...filters });
};
</script>
