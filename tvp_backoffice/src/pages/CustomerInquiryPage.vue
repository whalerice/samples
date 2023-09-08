<template>
  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :row-key="(row:any) => row.key"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="paginationChanged"
    :scroll="{ x: 2500 }"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'route'">
        {{ $t(optionList.route[text]) }}
      </template>

      <template v-if="column.dataIndex === 'category1'">
        {{ $t(optionList.inquiryCategory.parent[text]) }}
      </template>
      <template v-if="column.dataIndex === 'category2'">
        {{ $t(optionList.inquiryCategory.child[text]) }}
      </template>

      <template v-if="column.dataIndex === 'title'">
        <a-typography-link
          @click="
            (emailInquiryAnswerModalVisible = !emailInquiryAnswerModalVisible),
              (emailInquiryAnswerData = record)
          "
        >
          {{ text.length > 50 ? `${text.substr(0, 49)}…` : text }}
        </a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'message'">
        {{ text.length > 50 ? `${text.substr(0, 49)}…` : text }}
      </template>

      <template v-if="column.dataIndex === 'status'">
        <a-row :gutter="[10, 10]">
          <a-col>
            {{
              text === 0
                ? $t('common.word.request')
                : text === 1
                ? $t('common.word.dev')
                : text === 2
                ? $t('common.word.customer_center')
                : $t('common.word.complete')
            }}
          </a-col>
          <a-col v-if="text !== 0 && text !== 3">
            <a-button>
              {{
                text === 1
                  ? $t('common.word.customer_center')
                  : $t('common.word.dev')
              }}
            </a-button>
          </a-col>
        </a-row>
      </template>
    </template>
  </a-table>

  <EmailInquiryAnswerModal
    :visible="emailInquiryAnswerModalVisible"
    @update:visible="(val) => (emailInquiryAnswerModalVisible = val)"
    :answer-data="emailInquiryAnswerData"
  />
</template>

<script setup lang="ts">
import EmailInquiryAnswerModal from '@/components/modal/inquiry/EmailInquiryAnswerModal.vue';
import FilterCard from '@/components/FilterCard.vue';

import { ref, watch } from 'vue';
import { TableColumnType } from 'ant-design-vue';
import {
  inquiryStatusOptions,
  inquiryCategory1Options,
  routeOptions,
  optionList,
} from '@/utils/constants';
import { useCustomPagination } from '@/utils/pagination';

const emailInquiryAnswerModalVisible = ref(false);
const emailInquiryAnswerData = ref({
  idName: '',
  email: '',
  category1: 0,
  category2: 0,
  title: '',
  message: '',
  status: 0,
});

const filters = ref<IFilter[]>([
  {
    id: 'a',
    label: 'common.word.request_date',
    type: 'date',
  },
  {
    id: 'a',
    label: 'common.word.proceed_date',
    type: 'date',
  },
  {
    id: 'a',
    label: 'common.word.status',
    type: 'select',
    options: inquiryStatusOptions,
  },
  {
    id: 'b',
    label: 'common.word.route',
    type: 'select',
    options: routeOptions,
  },
  {
    id: 'c',
    label: 'common.word.category',
    type: 'select',
    options: inquiryCategory1Options,
  },
  {
    id: 'dc',
    label: 'common.input.id_name_search',
    type: 'search',
  },
]);

const columns: TableColumnType[] = [
  {
    title: 'common.word.request_date',
    dataIndex: 'requestDate',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.route',
    dataIndex: 'route',
    sorter: true,
  },
  {
    title: 'common.word.category1',
    dataIndex: 'category1',
    sorter: true,
  },
  {
    title: 'common.word.category2',
    dataIndex: 'category2',
    sorter: true,
  },
  {
    title: 'common.word.id_name',
    dataIndex: 'idName',
    sorter: true,
  },
  {
    title: 'common.word.email',
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: 'common.word.title',
    dataIndex: 'title',
    sorter: true,
  },
  {
    title: 'common.word.message',
    dataIndex: 'message',
    sorter: true,
  },
  {
    title: 'common.word.status',
    dataIndex: 'status',
    sorter: true,
  },
  {
    title: 'common.word.progress_date',
    dataIndex: 'progressDate',
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
} = useCustomPagination(async (params: any) => []);
</script>
