<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    :class="{ 'table-bottom-center': isMobile }"
    :no-data-label="$t('table.message.no_data')"
    :rows="rows"
    :rows-per-page-options="[5, 10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    :grid="isMobile"
    binary-state-sort
    v-model:pagination="pagination"
    @update:pagination="(val) => val"
    @request="onRequest">
    <template v-slot:top-right>
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>
    <!-- <template v-slot:top-left>
      <span>{{ $t(tableTitle) }}</span>
    </template> -->
    <!-- <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''">
        <q-card :class="props.selected ? 'bg-grey-2' : ''" flat bordered class="table-card">
          <q-list dense class="table-card-list">
            <q-item v-for="col in props.cols.filter((col:any) => col.name !== 'desc')" :key="col.name">
              <q-item-section>
                <q-item-label class="title">{{ $t(col.label) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="value">{{ col.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center">
        <span> {{ message }} </span>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { apis } from 'src/stores/apis';
import { commonStore } from 'src/stores/common';

const { t } = useI18n();

const category = [
  { key: 1, label: () => t('common.text.betting') },
  { key: 2, label: () => t('common.text.result') },
];
const resultType = [
  { key: 0, label: () => t('common.text.lose') },
  { key: 1, label: () => t('common.text.win') },
  { key: 2, label: () => t('common.text.done') },
];
const bettingState = [
  { key: 1, label: () => t('common.text.progress') },
  { key: 2, label: () => t('common.text.done') },
];

const { comma } = commonStore.common();

const columns = ref<any[]>([
  {
    name: 'category',
    field: 'category',
    required: true,
    label: 'table.thead.category',
    align: 'left',
    sortable: true,
    format: (text: number) =>
      category.filter((e) => e.key === text).length > 0 ? category.filter((e) => e.key === text)[0].label() : text,
  },
  {
    name: 'game_Type ',
    field: 'game_Type',
    required: true,
    label: 'table.thead.game_type',
    align: 'left',
    sortable: true,
    style: 'width: 8%',
  },
  {
    name: 'gameCode',
    field: 'gameCode',
    required: true,
    label: 'table.thead.game_name',
    align: 'left',
    sortable: true,
    style: 'width: 8%',
  },
  {
    name: 'vendor_Name',
    field: 'vendor_Name',
    required: true,
    label: 'table.thead.vendor_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'netAmount',
    field: 'netAmount',
    required: true,
    label: 'table.thead.net_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'bettingAmount',
    field: 'bettingAmount',
    required: true,
    label: 'table.thead.betting_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'previousBalance',
    field: 'previousBalance',
    required: true,
    label: 'table.thead.prev_amount',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'result',
    field: 'result',
    required: true,
    label: 'table.thead.outcome',
    align: 'left',
    sortable: true,
    format: (text: any) =>
      resultType.filter((e) => e.key === text).length > 0 ? resultType.filter((e) => e.key === text)[0].label() : text,
  },
  {
    name: 'state',
    field: 'state',
    required: true,
    label: 'table.thead.betting_status',
    align: 'left',
    sortable: true,
    style: 'width: 10%',
    format: (text: any) =>
      bettingState.filter((e) => e.key === text).length > 0
        ? bettingState.filter((e) => e.key === text)[0].label()
        : text,
  },
  {
    name: 'bettingTime',
    field: 'bettingTime',
    required: true,
    label: 'table.thead.betting_time',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
]);

// const tableTitle = ref('tab.title.betting_history');
const tableRef = ref();
const rows = ref<any[]>([]);
const filter = ref('');
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({
  sortBy: '',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});
const isMobile = ref(Platform.is.mobile === undefined ? false : true);

const onRequest = async (props: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  // const filter = props.filter;
  const send = {
    CurrentPage: page,
    CurrentPageSize: rowsPerPage,
    Order: sortBy,
    Sort: descending ? 'desc' : 'asc',
    Req_BeforeDate: '',
    Req_AfterDate: '',
    Game_Type: 0,
  };

  try {
    const response = await apis.BettingHistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;

      if (returnData.totalCount) {
        total.value = returnData.totalCount.count;
      }
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
  tableRef.value.requestServerInteraction();
});
</script>

<style scoped></style>
