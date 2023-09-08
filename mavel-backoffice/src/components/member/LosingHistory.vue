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

    <template v-slot:body-cell-role="props">
      <q-td :props="props">
        <span v-if="options.role.filter((e:any) => e.value === props.row.role).length > 0">
          {{ options.role.filter((e: any) => e.value === props.row.role)[0].label() }}
        </span>
        <span v-else>-</span>
      </q-td>
    </template>
    <template v-slot:body-cell-game_name="props">
      <q-td :props="props">
        <span>{{ props.row.name_En }} ({{ props.row.name_Ko }})</span>
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
const columns = ref<any[]>([
  // {
  //   name: 'user_Id',
  //   field: 'user_Id',
  //   label: 'table.thead.user_id',
  //   align: 'left',
  //   sortable: true,
  // },
  // {
  //   name: 'role',
  //   field: 'role',
  //   label: 'table.thead.role',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'game_name',
    field: 'game_name',
    label: 'table.thead.game_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'reward_Amount',
    field: 'reward_Amount',
    label: 'table.thead.reward_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'use_Detail',
    field: 'use_Detail',
    label: 'table.thead.content',
    align: 'left',
    sortable: true,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    label: 'table.thead.registration_date',
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
    Reward_Type: RewardType.Losing,
    user_Idx: Number(route.params.idx),
  };

  try {
    const response = await apis.manager.RewardHistory(send);

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
