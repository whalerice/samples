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

    <template v-slot:body-cell-use_Type="props">
      <q-td :props="props">
        <template v-if="options.useCategory.filter((e: any) => e.value === props.row.use_Type).length > 0">
          {{ options.useCategory.filter((e: any) => e.value === props.row.use_Type)[0].label() }}
        </template>
        <template v-else>{{ props.row.use_Type }}</template>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import UserBtn from 'src/components/UserBtn.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';

import { comma, pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { FilterDefault, SiteGrade } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { siteIdx } = storeToRefs(userStore.user());

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
    name: 'user_Id',
    field: 'user_Id',
    required: true,
    label: 'table.thead.user_id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'use_Type',
    field: 'use_Type',
    required: true,
    label: 'table.thead.use_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'use_Detail',
    field: 'use_Detail',
    required: true,
    label: 'table.thead.content',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cash',
    field: 'cash',
    label: 'table.thead.cash',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'after_Cash',
    field: 'after_Cash',
    label: 'table.thead.after_cash',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
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
    user_Idx: 0, //조회하고자 하는 User_Idx (0 : 전체 내역, User_Idx : 조회하는 아이디의 내역)
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
    const response = await apis.manager.Cashhistory(send);

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

  searchOption.value = useFilter(useOption, options.filterDefault);

  onRefresh();
});
</script>
