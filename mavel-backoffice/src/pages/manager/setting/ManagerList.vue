<template>
  <!-- v-if="siteIdx === SiteGrade.Admin" -->
  <a-space class="q-mb-md">
    <a-button type="primary" @click="open(null)">
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

    <template v-slot:body-cell-user_Id="props">
      <q-td :props="props">
        <a-typography-link @click="open(props.row)">{{ props.row.user_Id }}</a-typography-link>
      </q-td>
    </template>
    <template v-slot:body-cell-rw="props">
      <q-td :props="props">
        {{ options.authorityRW.filter((e: any) => e.value === props.row.rw)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        <a-badge :status="props.row.status === ManagerStatus.Normal ? 'success' : 'error'" />
        {{ options.managerStatus.filter((e: any) => e.value === props.row.status)[0].label() }}
      </q-td>
    </template>
  </q-table>
  <ManagerDrawer :show="showDrawer" :data="sendData" @update:show="closeDrawer" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import ManagerDrawer from 'components/ManagerDrawer.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined, FormOutlined } from '@ant-design/icons-vue';
import type { SelectProps } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { SiteGrade, FilterDefault, ManagerStatus } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const { siteIdx } = storeToRefs(userStore.user());
const { getSite } = commonStore.board();

const showDrawer = ref<boolean>(false);
const sendData = ref<any>(null);

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
    label: 'table.thead.user_id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nick',
    field: 'nick',
    label: 'table.thead.nick',
    align: 'left',
    sortable: true,
  },
  {
    name: 'rw',
    field: 'rw',
    label: 'table.thead.rw_permissions',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    field: 'status',
    label: 'table.thead.status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'site_Name',
    field: 'site_Name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
    style: 'width: 10%',
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
    const response = await apis.manager.ManagerList(send);
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

const open = (data: any) => {
  showDrawer.value = true;
  sendData.value = data;
};

const closeDrawer = (state: boolean) => {
  showDrawer.value = state;
  onRefresh();
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
  let useOption = siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];
  searchOption.value = useFilter(useOption, options.filterDefault);
  getSite();
  onRefresh();
});
</script>
