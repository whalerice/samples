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
    :visible-columns="visibleColumns"
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

    <template v-slot:body-cell-role="props">
      <q-td :props="props">
        {{ options.role.filter((e: any) => e.value === props.row.role)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        {{ options.userStatus.filter((e: any) => e.value === props.row.status)[0].label() }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { apis } from 'src/stores/apis';
import { comma, pageOptions, options, pages } from 'src/boot/global';
import { RewardType } from 'src/components/models/enums';

const route = useRoute();
const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const visibleColumns = ref<string[]>([]);

const columns = ref<any[]>([
  {
    name: 'belong',
    field: 'belong',
    label: 'table.thead.belong',
    align: 'left',
    sortable: true,
  },
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
    name: 'role',
    field: 'role',
    label: 'table.thead.role',
    align: 'left',
    sortable: true,
  },
  {
    name: 'level',
    field: 'level',
    label: 'table.thead.level',
    align: 'left',
    sortable: true,
  },

  {
    name: 'referral_Id',
    field: 'referral_Id',
    label: 'table.thead.referral_id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'rolling',
    field: 'rolling',
    label: 'table.thead.rolling',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'losing',
    field: 'losing',
    label: 'table.thead.losing',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'status',
    field: 'status',
    label: 'table.thead.status',
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
    user_Idx: Number(route.params.idx),
  };

  try {
    const response = await apis.manager.UserLowerMemberList(send);

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

const params = { params: route.params, query: route.query };

onMounted(() => {
  visibleColumns.value =
    Number(params.query.type) === RewardType.Rolling
      ? ['belong', 'user_Id', 'nick', 'role', 'level', 'referral_Id', 'rolling', 'status']
      : ['belong', 'user_Id', 'nick', 'role', 'level', 'referral_Id', 'losing', 'status'];

  // ['belong', 'user_Id', 'nick', 'role', 'level', 'referral_Id', 'rolling', 'losing', 'status']

  onRefresh();
});
</script>
