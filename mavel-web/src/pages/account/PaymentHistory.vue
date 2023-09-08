<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    :class="{ 'table-bottom-center': isMobile }"
    :grid="isMobile"
    :no-data-label="$t('table.message.no_data')"
    :rows="rows"
    :rows-per-page-options="[5, 10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    binary-state-sort
    v-model:pagination="pagination"
    @request="onRequest">
    <!-- <template v-slot:top-left>
      <span>{{ $t(tableTitle) }}</span>
    </template> -->
    <template v-slot:top-right>
      <!-- <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
        <template v-slot:append>
        </template>
      </q-input> -->
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>

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
    <template v-slot:body-cell-use_Type="props">
      <q-td :props="props">
        {{ $t(useType.filter((e) => e.key === props.row.use_Type)[0].label) }}
      </q-td>
    </template>
    <template v-slot:body-cell-payment_State="props">
      <q-td :props="props">
        {{ $t(paymentState.filter((e) => e.key === props.row.payment_State)[0].label) }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { ref, onMounted } from 'vue';
import { apis } from 'src/stores/apis';
import { commonStore } from 'src/stores/common';
import { CurrencyType, UseType, PaymentState } from 'src/components/models/enums';

const { comma } = commonStore.common();

const useType = [
  { key: UseType.Charging, label: 'common.text.charging' },
  { key: UseType.Exchange, label: 'common.text.exchange' },
];

const currencyType = [
  { key: CurrencyType.USD, label: 'USD' },
  { key: CurrencyType.KRW, label: 'KRW' },
  { key: CurrencyType.EUR, label: 'EUR' },
  { key: CurrencyType.JPY, label: 'JPY' },
  { key: CurrencyType.CNY, label: 'CNY' },
  { key: CurrencyType.PHP, label: 'PHP' },
];

const paymentState = [
  { key: PaymentState.Request, label: 'common.text.request' },
  { key: PaymentState.Approval, label: 'common.text.approval' },
  { key: PaymentState.Waiting, label: 'common.text.waiting' },
  { key: PaymentState.Refusal, label: 'common.text.refusal' },
  { key: PaymentState.Failed, label: 'common.text.failed' },
];

const columns = ref<any[]>([
  {
    name: 'use_Type',
    field: 'use_Type',
    required: true,
    label: 'table.thead.use_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'pG_Name',
    field: 'pG_Name',
    required: true,
    label: 'table.thead.site_payment',
    align: 'left',
    sortable: true,
  },
  {
    name: 'pg_Approval_No',
    field: 'pg_Approval_No',
    required: true,
    label: 'table.thead.pg_approval_no',
    align: 'left',
    sortable: true,
  },
  {
    name: 'currency_Type',
    field: 'currency_Type',
    required: true,
    label: 'table.thead.currency_type',
    align: 'left',
    format: (val: number) => currencyType.filter((e) => e.key === val)[0].label,
    sortable: true,
  },
  {
    name: 'price',
    field: 'price',
    required: true,
    label: 'table.thead.price',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'payment_State',
    field: 'payment_State',
    required: true,
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    required: true,
    label: 'table.thead.addtime',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
  {
    name: 'processing_Date',
    field: 'processing_Date',
    required: true,
    label: 'table.thead.processing_date',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
]);

// const tableTitle = ref('tab.title.payment_history');
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
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;
  loading.value = true;

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    user_Filter: 0,
    search: '',
  };

  try {
    const response = await apis.PaymentHistory(send);

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
