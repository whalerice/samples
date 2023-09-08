<template>
  <a-space class="q-mb-md">
    <a-button type="primary" @click="openResource(null)">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.register') }}
    </a-button>
  </a-space>

  <a-card size="small" class="search-area">
    <a-space>
      <a-range-picker v-model:value="search.date" :format="dateFormat" />
      <a-input-group compact>
        <a-select v-model:value="search.type" :options="searchOption" />
        <a-input v-model:value="search.text" :placeholder="$t('common.placeholder.search')" @pressEnter="onSearch" />
      </a-input-group>
      <a-button type="primary" @click="onSearch">
        <template #icon><SearchOutlined /></template>
        {{ $t('common.button.search') }}
      </a-button>
    </a-space>
  </a-card>

  <q-table
    flat
    ref="tableRef"
    row-key="name"
    no-data-label="noData"
    color="primary"
    binary-state-sort
    v-model:pagination="pagination"
    :rows="rows"
    :rows-per-page-options="pageOptions"
    :columns="columns"
    :loading="loading"
    :rows-per-page-label="$t('common.text.per_page')"
    @update:pagination="(val) => val"
    @request="onRequest">
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:no-data="{ message }">
      <NoData v-if="message === 'noData'" />
      <TableSkeleton v-else :column="columns.length" />
    </template>
    <template v-slot:body-cell-resource_Key="props">
      <q-td :props="props">
        <a-typography-link @click="openResource(props.row)">
          {{ props.row.resource_Key }}
        </a-typography-link>
      </q-td>
    </template>
    <template v-slot:body-cell-ko="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.ko" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-en="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.en" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-cn="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.cn" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-jp="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.jp" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-ru="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.ru" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-ph="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.ph" :ellipsis="true" />
      </q-td>
    </template>
    <template v-slot:body-cell-th="props">
      <q-td :props="props">
        <a-typography-paragraph v-model:content="props.row.th" :ellipsis="true" />
      </q-td>
    </template>
  </q-table>
  <ResourceDetails :show="isDetail" :data="sendData" @close="closeResource" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import ResourceDetails from 'components/modals/ResourceDetails.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { FormOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, useFilter, dateFormat, options, pages } from 'src/boot/global';
import { FilterDefault } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const { t } = useI18n();

const isDetail = ref<boolean>(false);
const sendData = ref<any | null>(null);

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });

const columns = ref<any[]>([
  {
    name: 'resource_Key',
    field: 'resource_Key',
    required: true,
    label: 'table.thead.resource_key',
    align: 'left',
    sortable: true,
  },
  {
    name: 'en',
    field: 'en',
    required: true,
    label: 'common.language.en',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ko',
    field: 'ko',
    required: true,
    label: 'common.language.ko',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cn',
    field: 'cn',
    required: true,
    label: 'common.language.zh',
    align: 'left',
    sortable: true,
  },
  {
    name: 'jp',
    field: 'jp',
    required: true,
    label: 'common.language.ja',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ru',
    field: 'ru',
    required: true,
    label: 'common.language.ru',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ph',
    field: 'ph',
    required: true,
    label: 'common.language.ph',
    align: 'left',
    sortable: true,
  },
  {
    name: 'th',
    field: 'th',
    required: true,
    label: 'common.language.th',
    align: 'left',
    sortable: true,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    required: true,
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (props: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: searchSendData.value.date ? dayjs(searchSendData.value.date[0]).format(dateFormat) : '',
    req_AfterDate: searchSendData.value.date ? dayjs(searchSendData.value.date[1]).format(dateFormat) : '',
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.ResourceList(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;
      if (returnData.totalCount) total.value = returnData.totalCount.count;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsNumber = total.value;
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

const openResource = (e: any) => {
  isDetail.value = true;
  sendData.value = e;
};

const closeResource = (e: any) => {
  isDetail.value = e;
  onRefresh();
};

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

onMounted(() => {
  let useOption = [FilterDefault.All];

  const custom = [
    { value: 1, label: () => t('common.label.resource_key') },
    { value: 2, label: () => t('common.label.text_search') },
  ];

  searchOption.value = useFilter(useOption, options.filterDefault, custom);

  onRefresh();
});
</script>
