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
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { apis } from 'src/stores/apis';
import { comma, pageOptions, pages, options } from 'src/boot/global';
import { UserType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';

const { t } = useI18n();
const route = useRoute();
const { memberType } = storeToRefs(userStore.sign());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const category = [
  { value: 1, label: () => t('common.text.betting') },
  { value: 2, label: () => t('common.text.result') },
];

const columns = ref<any[]>([
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

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    // User_Idx: props.data.user_Idx,
    user_Idx: Number(route.params.idx),
  };

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.BettingHistory(send)
        : await apis.partner.BettingHistory(send);

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
