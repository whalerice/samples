<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    no-data-label="noData"
    color="primary"
    binary-state-sort
    hide-bottom
    :rows="rows"
    :columns="columns"
    :loading="loading"
    :rows-per-page-options="[10]"
    :rows-per-page-label="$t('common.text.per_page')"
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

import { onMounted, ref } from 'vue';

import { comma } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);

const columns = ref<any[]>([
  {
    name: 'inputDate',
    field: 'inputDate',
    label: 'table.thead.sortation',
    align: 'left',
    sortable: true,
  },
  {
    name: 'charge',
    field: 'charge',
    label: 'table.thead.deposit_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'chargeCompletion',
    field: 'chargeCompletion',
    label: 'table.thead.deposit_completion_num',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'exchange',
    field: 'exchange',
    label: 'table.thead.withdrawal_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'rewardCnt',
    field: 'rewardCnt',
    label: 'table.thead.withdrawals_completed_num',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'exchangeCompletion',
    field: 'exchangeCompletion',
    label: 'table.thead.settlement_num',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'rewardAmount',
    field: 'rewardAmount',
    label: 'table.thead.settlement_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'calculate',
    field: 'calculate',
    label: 'table.thead.d_w_settlement',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'bettingCnt',
    field: 'bettingCnt',
    label: 'table.thead.betting_num',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'betting',
    field: 'betting',
    label: 'table.thead.betting_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'winCnt',
    field: 'winCnt',
    label: 'table.thead.win_num',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'win',
    field: 'win',
    label: 'table.thead.win_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'bettingResult',
    field: 'bettingResult',
    label: 'table.thead.b_w_settlement',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'completionUser',
    field: 'completionUser',
    label: 'table.thead.member_subscriber',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'bettingUserCnt',
    field: 'bettingUserCnt',
    label: 'table.thead.batting_user',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
]);

const onRequest = async () => {
  loading.value = true;

  try {
    const response = await apis.manager.SummaryTable();

    if (response.data.errCode === 0) {
      rows.value = response.data.returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  onRefresh();
});
</script>
