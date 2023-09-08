<template>
  <FilterCard
    :filters="filters"
    @search="search"
    v-if="!props.id && !props.isTop"
  />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(index:any) => index"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1400 }"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'status'">
        <TransactionStatusBundle
          :type="text"
          :record="record"
          @transaction="onTransaction"
        />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import TransactionStatusBundle from '@/components/TransactionStatusBundle.vue';

import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { ColumnsType } from 'ant-design-vue/lib/table';
import { depWitOptions, depWitStatusOptions } from '@/utils/constants';
import { comma } from '@/boot/global';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const { t } = useI18n();
const props = defineProps({
  id: {
    type: String,
    required: false,
  },
  isTop: { type: Boolean, required: false },
});

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.request_date',
    type: 'date',
  },
  {
    id: 'completedTime',
    label: 'common.word.proceed_date',
    type: 'date',
  },
  {
    id: 'transactionType',
    label: 'common.word.deposit_withdrawal',
    type: 'select',
    options: depWitOptions,
  },
  {
    id: 'transactionStatus',
    label: 'common.word.status',
    type: 'select',
    options: depWitStatusOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: ColumnsType = [
  {
    title: t('common.word.request_date'),
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text === null ? '' : dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: t('common.word.proceed_date'),
    dataIndex: 'completedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) =>
      text === null ? '' : dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: t('common.word.email'),
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: t('common.word.nickname'),
    dataIndex: 'nickname',
    sorter: true,
  },

  {
    title: t('common.word.deposit_withdrawal'),
    dataIndex: 'type',
    sorter: true,
    customRender: ({ text }) =>
      text === 0 ? t('common.word.withdrawal') : t('common.word.deposit'),
  },
  {
    title: t('common.word.previous_balance'),
    dataIndex: 'beforeBalance',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: t('common.word.request_amount'),
    dataIndex: 'requestAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: t('common.word.processing_after_balance'),
    dataIndex: 'afterBalance',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: t('common.word.status'),
    dataIndex: 'status',
    sorter: true,
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.investment.investment(params),
  (params: any) => {
    if (props.id) {
      return {
        ...params,
        filters: {
          ...params.filters,
          id: props.id,
        },
      };
    }

    if (props.isTop) {
      return {
        ...params,
        filters: {
          ...params.filters,
          transactionType: [0],
          transactionStatus: [0],
        },
      };
    }

    return params;
  }
);

const onTransaction = async (data: { id: string; isApproved: boolean }) => {
  await api.auto.investment.managerTransaction(data.id, data.isApproved);
  search();
};
</script>
