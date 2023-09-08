<template>
  <FilterCard :filters="filters" @search="search" v-if="!props.data" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(index:any) => index"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 2000 }"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { ColumnsType } from 'ant-design-vue/lib/table';

import { comma } from '@/boot/global';
import { roundOptions } from '@/utils/constants';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';
import { PropType } from 'vue';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
});

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.game_date',
    type: 'date',
  },
  {
    id: 'round',
    label: 'common.word.round',
    type: 'select',
    options: roundOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: ColumnsType = [
  {
    title: () => t('common.word.round'),
    dataIndex: 'round',
    sorter: true,
    align: 'right',
  },
  {
    title: () => t('common.word.time'),
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: () => t('common.word.partner'),
    dataIndex: 'investor',
    sorter: true,
  },
  {
    title: () => t('common.word.top_distributor'),
    dataIndex: 'topAgent',
    sorter: true,
  },
  {
    title: () => t('common.word.id'),
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: () => t('common.word.coin'),
    dataIndex: 'coinCode',
    sorter: true,
    align: 'center',
  },
  {
    title: () => t('common.word.predict_amount_ud'),
    dataIndex: 'predictAmountUd',
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.UpDown),
  },
  {
    title: () => t('common.word.predict_amount_oe'),
    dataIndex: 'predictAmountOe',
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.EvenOdd),
  },
  {
    title: () => t('common.word.predict_amount_bs'),
    dataIndex: 'predictAmountBs',
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.BigSmall),
  },
  {
    title: () => t('common.word.total_predict_amount'),
    dataIndex: 'predictionAmountTotal',
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.winning_amount_ud'),
    dataIndex: 'winningAmountUd',
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.UpDown),
  },
  {
    title: () => t('common.word.winning_amount_oe'),
    dataIndex: 'winningAmountOe',
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.EvenOdd),
  },
  {
    title: () => t('common.word.winning_amount_bs'),
    dataIndex: 'winningAmountBs',
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.BigSmall),
  },
  {
    title: () => t('common.word.total_winning_amount'),
    dataIndex: 'winningAmountTotal',
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.gameManagement.user(params),
  (params: any) => {
    if (props.data) {
      return {
        ...params,
        filters: {
          ...params.filters,
          id: props.data.memberId,
        },
      };
    }

    return params;
  }
);
</script>
