<template>
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

    <template v-slot:body-cell-location="props">
      <q-td :props="props">
        <div>{{ props.row.country }}</div>
        <div>{{ props.row.region }} / {{ props.row.city }}</div>
        <div>{{ props.row.loc }}</div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { onMounted, ref } from 'vue';
import { pageOptions, pages } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const columns = ref<any[]>([
  {
    name: 'platform',
    field: 'platform',
    label: 'table.thead.platform',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ipAddress',
    field: 'ipAddress',
    label: 'table.thead.ip',
    align: 'left',
    sortable: true,
  },
  {
    name: 'location',
    field: 'location',
    label: 'table.thead.location',
    align: 'left',
    sortable: true,
  },
  {
    name: 'timeZone',
    field: 'timeZone',
    label: 'table.thead.timezone',
    align: 'left',
    sortable: true,
  },
  {
    name: 'domain',
    field: 'domain',
    label: 'table.thead.domain',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.access_date',
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
  };

  try {
    const response = await apis.partner.UserConnectList(send);

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
