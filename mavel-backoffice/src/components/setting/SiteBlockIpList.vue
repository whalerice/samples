<template>
  <a-typography-title :level="5">{{ $t('site.drawer.site_block') }}</a-typography-title>
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

    <template v-slot:body-cell-block_Type="props">
      <q-td :props="props">
        {{ options.blockType.filter((e: any) => e.value === props.row.block_Type)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-block_State="props">
      <q-td :props="props">
        {{ options.blockState.filter((e: any) => e.value === props.row.block_State)[0].label() }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { onMounted, ref } from 'vue';

import { pageOptions, options, pages } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const columns = ref<any[]>([
  {
    name: 'site_Name',
    field: 'site_Name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_Type',
    field: 'block_Type',
    label: 'table.thead.block_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'memo',
    field: 'memo',
    label: 'table.thead.memo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_Words',
    field: 'block_Words',
    label: 'table.thead.block_words',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_State',
    field: 'block_State',
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.processing_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (t: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = t.pagination;

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    User_Filter: 0,
    Search: '',
  };

  try {
    const response = await apis.manager.SiteBlockIpList(send);

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

onMounted(() => {
  onRefresh();
});
</script>
