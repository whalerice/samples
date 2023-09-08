<template>
  <p>No API : RollingReserveManagementPage</p>

  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1000 }"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'grade'">
        {{
          text === 0 ? $t('common.word.user') : $t(`common.word.agent${text}`)
        }}
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
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';

import { ColumnsType } from 'ant-design-vue/lib/table';
import { useCustomPagination } from '@/utils/pagination';

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.reserve_date',
    type: 'date',
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: ColumnsType = [
  {
    title: 'common.word.round',
    dataIndex: 'round',
    sorter: true,
    align: 'center',
  },
  {
    title: 'common.word.time',
    dataIndex: 'time',
    sorter: true,
    align: 'center',
  },
  {
    title: 'common.word.partner',
    dataIndex: 'partner',
    sorter: true,
  },
  {
    title: 'common.word.top_agent',
    dataIndex: 'topAgent',
    sorter: true,
  },
  {
    title: 'common.word.id',
    dataIndex: 'id',
    sorter: true,
  },
  {
    title: 'common.word.nickname',
    dataIndex: 'nickname',
    sorter: true,
  },
  {
    title: 'common.word.grade',
    dataIndex: 'grade',
    sorter: true,
    align: 'center',
  },
  {
    title: 'common.word.before_rolling',
    dataIndex: 'beforeAmount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.reserve_rolling',
    dataIndex: 'amount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.after_rolling',
    dataIndex: 'afterAmount',
    sorter: true,
    align: 'right',
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => {
  const data = new Promise((resolve, reject) => {
    const arr: object[] = [];
    [...Array(100)].map((_, i) => {
      arr.push({
        key: i,
        round: i,
        time: '2023-02-20 22:22',
        partner: 'partner',
        topAgent: 'topAgent',
        id: 'khr157929@quagga.ai',
        nickname: 'nickname',
        grade: i % 6,
        beforeAmount: 14,
        amount: 1,
        afterAmount: 15,
      });
    });

    setTimeout(() => {
      resolve(arr);
    }, 250);
  }).then((data: any) => {
    return data.reverse();
  });

  return data;
});
</script>
