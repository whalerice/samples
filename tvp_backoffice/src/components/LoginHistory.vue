<template>
  <a-table
    :columns="columns"
    :pagination="pagination"
    :row-key="(record:any) => record.key"
    :loading="loading"
    :data-source="dataSource"
    @change="paginationChanged"
  >
  </a-table>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { TableColumnType } from 'ant-design-vue';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const columns: TableColumnType[] = [
  {
    title: () => t('common.word.connection'),
    dataIndex: 'connection',
    align: 'center',
    customRender: ({ text }) => (text === 1 ? 'Web' : 'App'),
  },
  {
    title: () => t('common.word.ip'),
    dataIndex: 'ip',
    align: 'center',
  },
  {
    title: () => t('common.word.latest_connection_time'),
    dataIndex: 'latestConnectionTime',
    align: 'center',
  },
  {
    title: () => t('common.word.status'),
    dataIndex: 'status',
    align: 'center',
    customRender: ({ text }) => (text === 1 ? 'Success' : 'Failed'),
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.member.loginHistory(params),
  (params: any) => ({ ...params, filters: { id: props.data?.memberId } })
);
</script>
