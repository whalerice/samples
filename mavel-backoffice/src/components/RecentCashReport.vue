<template>
  <!-- v-model:pagination="pagination" -->
  <!-- :rows-per-page-options="pageOptions" -->
  <!-- @update:pagination="(val) => val" -->
  <q-table
    flat
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

    <template v-slot:body-cell-use_Type="props">
      <q-td :props="props">
        {{ options.useCategory.filter((e: any) => e.value === props.row.use_Type)[0].label() }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { apis } from 'src/stores/apis';
import { comma, options } from 'src/boot/global';
import { UserType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';

const { memberType } = storeToRefs(userStore.sign());

const rows = ref<any[]>([]);
const loading = ref(false);
const columns = ref<any[]>([
  {
    name: 'use_Type',
    field: 'use_Type',
    label: 'table.thead.use_type',
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
    name: 'user_Detail',
    field: 'user_Detail',
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
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async () => {
  loading.value = true;

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.RecentCashReport()
        : await apis.partner.RecentCashReport();

    if (response.data.errCode === 0) {
      rows.value = response.data.returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const onRefresh = () => {
  onRequest();
};

onMounted(() => {
  onRefresh();
});
</script>
