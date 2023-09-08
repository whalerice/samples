<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :width="1200"
    :title="$t('common.word.settlement_amount')"
    :destroyOnClose="true"
  >
    <a-table
      :columns="columns"
      :row-key="(record:any) => record.key"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      :scroll="{ x: 1200 }"
      class="q-mt-xl"
      @change="paginationChanged"
    >
      <template #headerCell="{ title }">
        {{ $t(title) }}
      </template>
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'grade'">
          <template v-if="text === 5">
            {{ $t('common.word.user') }}
          </template>
          <template v-else>
            {{ $t(`common.word.agent${text + 1}`) }}
          </template>
        </template>
        <template v-if="column.dataIndex === 'beforeAmount'">
          <span>{{ $comma(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'amount'">
          <span>{{ $comma(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'afterAmount'">
          <span>{{ $comma(text) }}</span>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { useCustomPagination } from '@/utils/pagination';
import { TableColumnsType } from 'ant-design-vue';
import { computed, ref } from 'vue';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
const totalCount = ref(0);

const columns: TableColumnsType = [
  {
    title: 'common.word.round',
    dataIndex: 'round',
    align: 'center',
  },
  {
    title: 'common.word.time',
    dataIndex: 'time',
    align: 'center',
  },
  {
    title: 'common.word.top_agent',
    dataIndex: 'topAgent',
  },
  {
    title: 'common.word.id',
    dataIndex: 'id',
  },
  {
    title: 'common.word.nickname',
    dataIndex: 'nickname',
  },
  {
    title: 'common.word.grade',
    dataIndex: 'grade',
    align: 'center',
  },
  {
    title: 'common.word.before_rolling',
    dataIndex: 'beforeAmount',
    align: 'right',
  },
  {
    title: 'common.word.reserve_rolling',
    dataIndex: 'amount',
    align: 'right',
  },
  {
    title: 'common.word.after_rolling',
    dataIndex: 'afterAmount',
    align: 'right',
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  paginationChanged,
} = useCustomPagination(async (params: any) => []);
</script>
