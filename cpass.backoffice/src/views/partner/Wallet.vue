<template>
  <a-row :gutter="[15, 15]" class="mb-gap">
    <a-col :xs="24" :lg="12">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane v-for="(item, index) in componentList" :key="index" :tab="t(item.tab)">
          <component :is="item.component" v-if="activeKey === index" @refresh="refresh" />
        </a-tab-pane>
      </a-tabs>
    </a-col>

    <a-col :xs="24" :lg="12">
      <PartnerWallets />
    </a-col>
  </a-row>

  <PartnerPaymentSearch
    @search="getSearchData"
    :type="['partner.settlement.sortation', 'partner.settlement.state', 'req', 'pro']"
  />

  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
      <h4 class="title">{{ t('component.label.transaction_list') }}</h4>
      <div class="control-box">
        <DownloadCSV :csvFile="csvFile" :filename="t('component.label.transaction_list')" />
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
        <a-select
          v-model:value="selectedPageSize"
          label-in-value
          :options="pageSizeOptions"
          @change="selectPageSize"
        ></a-select>
      </div>
    </template>
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
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr" v-if="record.payment_Type !== 5">{{ record.addr }}</a-typography-text>
        <span class="swap-box" v-else>
          <a-typography-text class="addr">{{ record.from_Addr }}</a-typography-text>
          <fa-icon icon="fa-arrow-right" />
          <a-typography-text class="addr">{{ record.to_Addr }}</a-typography-text>
        </span>
      </template>
      <template v-if="column.dataIndex === 'state'">
        <!-- <template v-if="record.state === -1">{{ $t('datatable.text.waiting_1st_approval') }}</template> -->
        <!-- <template v-if="record.state === 0">{{ $t('datatable.text.waiting_2nd_approval') }}</template> -->
        <template v-if="record.state === -1 || record.state === 0">{{ $t('search.label.waiting_approval') }}</template>
        <template v-if="record.state === 1">{{ $t('datatable.text.waiting_transmission') }}</template>
        <template v-if="record.state === 2">{{ $t('datatable.text.success') }}</template>
        <template v-if="record.state === 3">{{ $t('datatable.text.failed') }}</template>
        <template v-if="record.state === 4">{{ $t('search.label.1st_refusal_approval') }}</template>
        <template v-if="record.state === 5">{{ $t('search.label.2nd_refusal_approval') }}</template>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import DownloadCSV from '@/components/common/DownloadCSV.vue';
import SettlementApplication from '@/components/partner/SettlementApplication.vue';
import SwapApplication from '@/components/partner/SwapApplication.vue';
import PartnerWallets from '@/components/partner/PartnerWallets.vue';
import PartnerPaymentSearch from '@/components/search/PartnerPaymentSearch.vue';

import { ref, computed, onBeforeMount, markRaw } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy, matchingCoinLabel } from '@/assets/js/global.js';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const activeKey = ref(0);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const componentList = [
  { component: markRaw(SettlementApplication), tab: 'search.label.send' },
  { component: markRaw(SwapApplication), tab: 'common.button.swap' },
];
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const dataControl = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  activity: '1,2,3,4,5',
  state: '-1,0,1,2,3,4,5',
});

const csvFile = ref();
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    width: '10%',
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
    width: '10%',
    sorter: true,
  },
  {
    title: 'datatable.thead.sortation',
    dataIndex: 'payment_Type',
    width: '10%',
    sorter: true,
  },
  {
    title: 'datatable.thead.coin_type',
    dataIndex: 'coin_Cd',
    width: '10%',
    sorter: true,
    className: 'btn-center',
  },
  {
    title: 'datatable.thead.coin_quantity',
    dataIndex: 'actual',
    align: 'right',
    width: '12%',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
    width: '*',
    sorter: true,
    className: 'btn-cell',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    width: '10%',
    sorter: true,
  },
]);

const queryData = async (params) => {
  let order = params.sortOrder === undefined ? '' : params.sortField;
  let sort =
    params.sortOrder !== undefined && params.sortOrder === 'ascend'
      ? 'asc'
      : params.sortOrder !== undefined && params.sortOrder === 'descend'
      ? 'desc'
      : '';

  try {
    const response = await apis.PartnerTransactionList({
      currentPage: params.page,
      currentPageSize: params.results,
      req_BeforeDate: dataControl.value.requestBeforeDate,
      req_AfterDate: dataControl.value.requestAfterDate,
      proc_BeforeDate: dataControl.value.concludeBeforeDate,
      proc_AfterDate: dataControl.value.concludeAfterDate,
      activity: dataControl.value.activity,
      state: dataControl.value.state,
      search: '',
      search_Type: '',
      order: order,
      sort: sort,
    });

    const csv = await apis.PartnerTransactionList({
      currentPage: 0,
      currentPageSize: params.results,
      req_BeforeDate: dataControl.value.requestBeforeDate,
      req_AfterDate: dataControl.value.requestAfterDate,
      proc_BeforeDate: dataControl.value.concludeBeforeDate,
      proc_AfterDate: dataControl.value.concludeAfterDate,
      activity: dataControl.value.activity,
      state: dataControl.value.state,
      search: '',
      search_Type: '',
      order: order,
      sort: sort,
    });

    if (response?.data.errCode === 0) {
      const count = response.data.returnData?.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      getCSV(csv.data.returnData.list);
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
  current,
  pageSize,
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

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const getCSV = (data) => {
  let csv = [];
  let row = [];
  // const coin = [
  //   {
  //     1: btc,
  //   },
  // ];

  columns.value.forEach((e) => {
    row.push(t(e.title));
  });
  csv.push(row.join(','));

  data.forEach((e) => {
    let coin =
      e.from_Coin_Cd === 1
        ? 'BTC'
        : e.from_Coin_Cd === 2
        ? 'ETH'
        : e.from_Coin_Cd === 3
        ? 'USDT'
        : e.from_Coin_Cd === 4
        ? 'XRP'
        : e.from_Coin_Cd === 6
        ? 'TRX'
        : e.from_Coin_Cd === 7
        ? 'CPESO'
        : '';

    let toCoin =
      e.to_Coin_Cd === 1
        ? '→ BTC'
        : e.to_Coin_Cd === 2
        ? '→ ETH'
        : e.to_Coin_Cd === 3
        ? '→ USDT'
        : e.to_Coin_Cd === 4
        ? '→ XRP'
        : e.to_Coin_Cd === 6
        ? '→ TRX'
        : e.to_Coin_Cd === 7
        ? '→ CPESO'
        : '';

    let viewCoin =
      e.from_Coin_Cd !== null && e.to_Coin_Cd !== null ? `${coin} ${toCoin}` : matchingCoinLabel(e?.coin_Cd);

    row = [];
    row.push(
      e.request_Date,
      e.processing_Date,
      e.payment_Type === 1
        ? t('datatable.text.send')
        : e.payment_Type === 2
        ? t('datatable.text.send_pay')
        : e.payment_Type === 3
        ? t('datatable.text.receive')
        : e.payment_Type === 4
        ? t('datatable.text.receive_pay')
        : e.payment_Type === 5
        ? t('datatable.text.swap')
        : '',
      viewCoin,
      e.actual,
      e.addr,
      e.state === 0
        ? t('datatable.text.waiting_2nd_approval')
        : e.state === 1
        ? t('datatable.text.waiting_transmission')
        : e.state === 2
        ? t('datatable.text.success')
        : e.state === 3
        ? t('datatable.text.failed')
        : t('datatable.text.waiting_1st_approval'),
    );
    csv.push(row.join(','));
  });
  csvFile.value = csv.join('\n');
};

const getSearchData = (searchData) => {
  const temp = deepCopy(searchData);
  dataControl.value = deepCopy({
    requestBeforeDate: temp.req_BeforeDate,
    requestAfterDate: temp.req_AfterDate,
    concludeBeforeDate: temp.proc_BeforeDate,
    concludeAfterDate: temp.proc_AfterDate,
    activity: temp.partnerSettlementSortation,
    state: temp.partnerSettlementState,
  });
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
const refresh = () => {
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

onBeforeMount(async () => {
  await store.dispatch('sign/partnerMyInfo');
  await store.dispatch('sign/partnerWalletInfo');
});
</script>
