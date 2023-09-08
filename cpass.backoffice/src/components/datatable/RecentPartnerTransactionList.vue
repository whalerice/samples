<template>
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    :pagination="false"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span v-if="column.dataIndex === 'request_Date'">
          {{ text }}
        </span>
        <span v-if="column.dataIndex === 'processing_Date'">
          {{ text }}
        </span>
      </template>

      <template v-if="column.dataIndex === 'payment_Type'">
        <template v-if="record.payment_Type === 1">{{ $t('datatable.text.send') }}</template>
        <template v-if="record.payment_Type === 2">{{ $t('datatable.text.send_pay') }}</template>
        <template v-if="record.payment_Type === 3">{{ $t('datatable.text.receive') }}</template>
        <template v-if="record.payment_Type === 4">{{ $t('datatable.text.receive_pay') }}</template>
        <template v-if="record.payment_Type === 5">{{ $t('datatable.text.swap') }}</template>
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        <i :class="`coin coin-${record.coin_Cd} md`" v-if="record.from_Coin_Cd === null" />
        <span class="swap-box" v-else>
          <i :class="`coin coin-${record.from_Coin_Cd} md`" />
          <fa-icon icon="fa-arrow-right" />
          <i :class="`coin coin-${record.to_Coin_Cd} md`" />
        </span>
      </template>
      <template v-if="column.dataIndex === 'actual'">
        <span class="swap-box" v-if="record.payment_Type === 5">
          {{ comma(record.from_Amount) }}
          <fa-icon icon="fa-arrow-right" />
          {{ comma(record.to_Amount) }}
        </span>
        <template v-else>{{ record.actual }}</template>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma } from '@/assets/js/global.js';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const totalCount = ref(0);
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    width: '10%',
  },
  {
    title: 'datatable.thead.sortation',
    dataIndex: 'payment_Type',
    width: '10%',
  },
  {
    title: 'datatable.thead.coin_type',
    dataIndex: 'coin_Cd',
    width: '10%',
    className: 'exclude-csv',
  },
  {
    title: 'datatable.thead.coin_quantity',
    dataIndex: 'actual',
    align: 'right',
    width: '12%',
  },
]);

const queryData = async (params) => {
  try {
    const response = await apis.PartnerTransactionList({
      currentPage: params.page,
      // currentPageSize: params.results,
      // req_BeforeDate: dataControl.value.requestBeforeDate,
      // req_AfterDate: dataControl.value.requestAfterDate,
      // proc_BeforeDate: dataControl.value.concludeBeforeDate,
      // proc_AfterDate: dataControl.value.concludeAfterDate,
      // activity: dataControl.value.activity,
      // state: dataControl.value.state,
      // search: '',
      // search_Type: '',
      // order: order,
      // sort: sort,
    });

    if (response?.data.errCode === 0) {
      return response.data.returnData.list;
    }
  } catch (error) {
    console.error(error);
  }
};

const {
  data: dataSource,
  run,
  loading,
} = usePagination(queryData, {
  formatResult: (res) => res,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'results',
  },
});

const handleTableChange = (pag, filters, sorter) => {
  totalCount.value = pag.total;
  run({
    results: pag.pageSize ? pag.pageSize : pag.results,
    page: pag.current ? pag.current : pag.page,
    sortField: sorter.field,
    sortOrder: sorter.order,
  });
};

const handleResizeColumn = (w, col) => {
  col.width = w;
};

onBeforeMount(async () => {});
</script>
