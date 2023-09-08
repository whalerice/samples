<template>
  <FilterCard
    :filters="filters"
    @search="search"
    v-if="!props.data && !props.isTop"
  />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(index:any) => index"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1000 }"
    @change="paginationChanged"
  >
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';

import { PropType, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ColumnsType } from 'ant-design-vue/lib/table';
import { RewardType } from '@/utils/enums';
import { comma, options, role } from '@/boot/global';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';
import { roleNames } from '@/router/routes';
import dayjs from 'dayjs';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object as PropType<IMemberManagementResponse>,
    required: true,
  },
  isTop: { type: Boolean, required: false },
});

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

const columns = computed<ColumnsType>(() => [
  {
    title: () => t('common.word.round'),
    dataIndex: 'round',
    sorter: true,
    align: 'right',
  },
  {
    title: () => t('common.word.time'),
    dataIndex: 'completedTime',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm'),
  },
  ...(role === roleNames.master
    ? [
        {
          title: () => t('common.word.partner'),
          dataIndex: 'partner',
          sorter: true,
        },
      ]
    : []),
  {
    title: () => t('common.word.top_agent'),
    dataIndex: 'topAgent',
    sorter: true,
  },
  {
    title: () => t('common.word.id'),
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: () => t('common.word.nickname'),
    dataIndex: 'nickname',
    sorter: true,
  },
  {
    title: () => t('common.word.grade'),
    dataIndex: 'level',
    sorter: true,
    align: 'center',
    customRender: ({ text }) =>
      text
        ? options.memberLevel.filter((e: any) => e.value === text)[0].label()
        : '',
  },
  // {
  //   title: () => t('common.word.before_losing'),
  //   dataIndex: 'beforeAmount',
  //   sorter: true,
  //   align: 'right',
  //   customRender: ({ text }) => comma(text),
  // },
  {
    title: () => t('common.word.losing'),
    dataIndex: 'amount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  // {
  //   title: () => t('common.word.after_losing'),
  //   dataIndex: 'afterAmount',
  //   sorter: true,
  //   align: 'right',
  //   customRender: ({ text }) => comma(text),
  // },
]);

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) =>
    await api.auto.settlement.reward(RewardType.Losing, params),
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
