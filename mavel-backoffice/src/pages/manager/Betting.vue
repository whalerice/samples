<template>
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
  <div class="text-right q-mb-sm">
    <ExcelDownload :data="searchSendData" url="BettingHistory" />
  </div>
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

    <template v-slot:body-cell-user_Id="props">
      <q-td :props="props">
        <UserBtn
          :idx="props.row.user_Idx"
          :id="props.row.user_Id"
          :type="props.row.rewardType"
          :status="props.row.status" />
      </q-td>
    </template>

    <!-- <template v-slot:body-cell-result="props">
      <q-td :props="props">
        <a-tag :color="props.row.result ? 'orange' : 'default'">
          {{ resultType.filter((e) => e.value === props.row.result)[0].label() }}
        </a-tag>
      </q-td>
    </template> -->
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import UserBtn from 'src/components/UserBtn.vue';
import ExcelDownload from 'src/components/ExcelDownload.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { comma, pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { SiteGrade, FilterDefault } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const category = [
  { value: 1, label: () => t('common.text.betting') },
  { value: 2, label: () => t('common.text.result') },
];

const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });

const columns = ref<any[]>([
  {
    name: 'user_Id',
    field: 'user_Id',
    label: 'table.thead.user_id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'category',
    field: 'category',
    label: 'table.thead.category',
    align: 'left',
    sortable: true,
    format: (text: number) =>
      category.filter((e) => e.value === text).length > 0 ? category.filter((e) => e.value === text)[0].label() : text,
  },
  {
    name: 'game_Type',
    field: 'game_Type',
    label: 'table.thead.game_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'gameCode',
    field: 'gameCode',
    label: 'table.thead.game_code',
    align: 'left',
    sortable: true,
  },
  {
    name: 'vendor_Name',
    field: 'vendor_Name',
    label: 'table.thead.vendor_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'netAmount',
    field: 'netAmount',
    label: 'table.thead.net_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'bettingAmount',
    field: 'bettingAmount',
    label: 'table.thead.betting_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'previousBalance',
    field: 'previousBalance',
    label: 'table.thead.prev_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'result',
    field: 'result',
    label: 'table.thead.outcome',
    align: 'left',
    sortable: true,
    format: (text: any) =>
      options.gameResultType.filter((e: any) => e.value === text).length > 0
        ? options.gameResultType.filter((e: any) => e.value === text)[0].label()
        : text,
  },
  {
    name: 'bettingTime',
    field: 'bettingTime',
    label: 'table.thead.betting_time',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (t: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = t.pagination;

  searchSendData.value.order = sortBy;
  searchSendData.value.sort = descending ? 'desc' : 'asc';

  const send = {
    user_Idx: 0,
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
    const response = await apis.manager.BettingHistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;

      if (returnData.totalCount) total.value = returnData.totalCount.count;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
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

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

onMounted(() => {
  let useOption =
    siteIdx.value === SiteGrade.Admin
      ? [FilterDefault.All, FilterDefault.SiteName, FilterDefault.IDNick]
      : [FilterDefault.All, FilterDefault.IDNick];

  const custom = [{ value: 3, label: () => t('common.label.game_code') }];

  searchOption.value = useFilter(useOption, options.filterDefault, custom);

  onRefresh();
});
</script>
