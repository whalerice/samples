<template>
  <div class="q-mb-xl" v-if="role === roleNames.partner">
    <GameProfit />
  </div>

  <FilterCard :filters="filters" @search="search" v-if="!props.id" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 2400 }"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import GameProfit from '@/components/GameProfit.vue';
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';

import dayjs from 'dayjs';
import { TableColumnsType } from 'ant-design-vue';

import { role } from '@/boot/global';
import { roleNames } from '@/router/routes';
import { roundOptions } from '@/utils/constants';
import { comma } from '@/boot';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const props = defineProps({
  id: {
    type: String,
    required: false,
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

const columns: TableColumnsType = [
  {
    title: 'common.word.round',
    dataIndex: 'round',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.time',
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm'),
  },
  {
    title: 'common.word.partner',
    dataIndex: 'investor',
    sorter: true,
  },
  {
    title: 'common.word.coin',
    dataIndex: 'coinCode',
    sorter: true,
  },
  {
    title: 'common.word.predict_amount_ud',
    dataIndex: 'predictAmountUd',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.UpDown),
  },
  {
    title: 'common.word.predict_amount_oe',
    dataIndex: 'predictAmountOe',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.EvenOdd),
  },
  {
    title: 'common.word.predict_amount_bs',
    dataIndex: 'predictAmountBs',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.predictionAmounts.BigSmall),
  },
  {
    title: 'common.word.total_predict_amount',
    dataIndex: 'predictionAmountTotal',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.winning_amount_ud',
    dataIndex: 'winningAmountUd',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.UpDown),
  },
  {
    title: 'common.word.winning_amount_oe',
    dataIndex: 'winningAmountOe',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.EvenOdd),
  },
  {
    title: 'common.word.winning_amount_bs',
    dataIndex: 'winningAmountBs',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.winningAmounts.BigSmall),
  },
  {
    title: 'common.word.total_winning_amount',
    dataIndex: 'winningAmountTotal',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.profit_amount_ud',
    dataIndex: 'profitAmountUd',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.profitAmounts.UpDown),
  },
  {
    title: 'common.word.profit_amount_oe',
    dataIndex: 'profitAmountOe',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.profitAmounts.EvenOdd),
  },
  {
    title: 'common.word.profit_amount_bs',
    dataIndex: 'profitAmountBs',
    sorter: true,
    align: 'right',
    customRender: ({ record }) => comma(record.profitAmounts.BigSmall),
  },
  {
    title: 'common.word.total_profit_amount',
    dataIndex: 'profitAmountTotal',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.fee',
    dataIndex: 'fee',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'common.word.net_profit',
    dataIndex: 'netProfitAmountTotal',
    sorter: true,
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
  async (params: any) => await api.auto.gameManagement.partner(params),
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

    return params;
  }
);
</script>
