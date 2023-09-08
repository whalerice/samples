<template>
  <FilterContainer
    v-if="!(isWallet || isPartner)"
    class="mb-10 filter-container"
    :data="filterData"
    @getData="getFilterData"
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
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #title v-if="!(isWallet || isPartner)">
      <h4 class="title">
        <span class="text">{{ $t('tab.label.transaction_history') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
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
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <template
          v-if="
            column.dataIndex !== 'user_Type' &&
            column.dataIndex !== 'deal_Type' &&
            column.dataIndex !== 'txId_Type' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'deal_State' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'actual' &&
            column.dataIndex !== 'addr'
          "
        >
          {{ text }}
        </template>
      </template>
      <template v-if="column.dataIndex === 'user_Type'">
        {{ getWalletUserType(t, text).label() }}
      </template>
      <template v-if="column.dataIndex === 'deal_Type'">
        {{ getWalletDealType(t, text).label() }}
      </template>
      <template v-if="column.dataIndex === 'txId_Type'">
        {{ getWalletTxIdType(t, record.txId_Type).label() }}
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        <i :class="`coin coin-${record.coin_Cd} md`" v-if="record.from_Coin_Cd === null" />
        <a-space v-else>
          <i :class="`coin coin-${record.from_Coin_Cd} md`" />
          <fa-icon icon="fa-arrow-right" />
          <i :class="`coin coin-${record.to_Coin_Cd} md`" />
        </a-space>
      </template>
      <template v-if="column.dataIndex === 'amount'">
        <a-space v-if="getWalletDealType(t, record.deal_Type).value === Enum.walletDealType.swap">
          {{ comma(record.from_Amount) }}
          <fa-icon icon="fa-arrow-right" />
          {{ comma(record.to_Amount) }}
        </a-space>
        <span v-else>
          {{ comma(record.amount) }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'actual'">
        <a-space v-if="getWalletDealType(t, record.deal_Type).value === Enum.walletDealType.swap">
          {{ comma(record.from_Actual) }}
          <fa-icon icon="fa-arrow-right" />
          {{ comma(record.to_Actual) }}
        </a-space>
        <span v-else>
          {{ comma(record.actual) }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'deal_State'">
        <a-typography-text :type="getWalletTransactionState(t, record.deal_State).color">
          {{ getWalletTransactionState(t, record.deal_State).label() }}
        </a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text
          class="addr"
          v-if="getWalletDealType(t, record.deal_Type).value !== Enum.walletDealType.swap"
        >
          {{ record.addr }}
        </a-typography-text>
        <span class="swap-box" v-else>
          <a-typography-text class="addr">{{ record.from_Addr }}</a-typography-text>
          <fa-icon icon="fa-arrow-right" />
          <a-typography-text class="addr">{{ record.to_Addr }}</a-typography-text>
        </span>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { usePagination } from 'vue-request';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import {
  comma,
  deepCopy,
  getWalletUserType,
  getWalletDealType,
  getWalletTxIdType,
  getWalletTransactionState,
} from '@/assets/js/global.js';
import { Enum } from '@/assets/js/enum.js';
import { apis } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: {
    type: String,
    require: false,
  },
  sn: {
    type: Number,
    require: false,
  },
});
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isWallet = computed(() => props.type === 'wallet');
const isPartner = computed(() => props.type === 'partner');
const isMobile = ref(isDeviceMobile.value);
const coinList = computed(() => store.state['sign'].coinList);
const errCode = computed(() => store.state['common'].errCode);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
let columns = [
  {
    title: 'common.text.date',
    dataIndex: 'addtime',
    sorter: true,
  },
  {
    title: 'datatable.text.user_type',
    dataIndex: 'user_Type',
    sorter: true,
    hidden: true,
  },
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
    sorter: true,
    width: '15%',
    hidden: true,
  },
  {
    title: 'datatable.thead.deal_type',
    dataIndex: 'deal_Type',
    sorter: true,
  },
  {
    title: 'datatable.text.transaction_type',
    dataIndex: 'txId_Type',
    sorter: true,
    width: '15%',
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    sorter: true,
    className: 'btn-center',
  },

  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    sorter: true,
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'fee',
    sorter: true,
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    sorter: true,
    width: '10%',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'deal_State',
    sorter: true,
  },
  {
    title: 'datatable.thead.tx_id',
    dataIndex: 'txId',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
    sorter: true,
    className: 'btn-cell',
  },
  // deal_State
];
const totalCount = ref(0);
const dataControl = ref({
  coinCd: Object.values(coinList.value).map((e) => e.value),
  userType: getWalletUserType(t).map((e) => e.value),
  dealType: getWalletDealType(t).map((e) => e.value),
  txIdType: getWalletTxIdType(t)
    .map((e) => e.request)
    .flat(),
  dealState: getWalletTransactionState(t).map((e) => e.value),
  search: '',
  processStartDate: '',
  processEndDate: '',
});
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isWallet.value || isPartner.value ? 'small' : '',
}));

const queryData = async (e) => {
  let sort;
  sort =
    e.sortOrder === 'ascend' && e.sortOrder !== undefined
      ? (sort = 'asc')
      : e.sortOrder === 'descend' && e.sortOrder !== undefined
      ? (sort = 'desc')
      : (sort = '');
  let order = e.sortOrder === undefined ? '' : e.sortField;

  const data = {
    userSn: isWallet.value || isPartner.value ? props.sn : 0,
    currentPage: e.page,
    currentPageSize: e.results,
    order: order,
    sort: sort,
    coinCd: dataControl.value.coinCd,
    userType: dataControl.value.userType,
    dealType: dataControl.value.dealType,
    txIdType: dataControl.value.txIdType,
    dealState: dataControl.value.dealState,
    search: dataControl.value.search,
    processStartDate: dataControl.value.processStartDate,
    processEndDate: dataControl.value.processEndDate,
  };

  try {
    const response = await apis.manager.UserTransactionList(data);
    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

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
  total,
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

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};
const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);
const filterData = [
  {
    type: 'rangePicker',
    name: 'processDate',
    placeHolder: () => {
      return t('common.text.date');
    },
    order: 1,
  },
  {
    type: 'select',
    name: 'user_type',
    data: getWalletUserType(t),
    order: 2,
    placeHolder: () => t('datatable.text.user_type'),
  },
  {
    type: 'select',
    name: 'deal_type',
    data: getWalletDealType(t),
    order: 3,
    placeHolder: () => t('datatable.thead.deal_type'),
  },
  {
    type: 'select',
    name: 'txId_type',
    data: getWalletTxIdType(t),
    order: 4,
    placeHolder: () => t('datatable.text.transaction_type'),
  },
  {
    type: 'select',
    name: 'coin_Cd',
    data: coinOption.value,
    order: 5,
    placeHolder: () => t('search.label.coin'),
  },
  {
    type: 'select',
    name: 'deal_State',
    data: getWalletTransactionState(t),
    order: 6,
    placeHolder: () => t('datatable.thead.state'),
  },
  {
    type: 'totalSearch',
    name: 'search',
    order: 7,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.wallet_transaction');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const getFilterData = (val) => {
  const temp = deepCopy(val);

  if (temp.txId_type.includes(Enum.walletTxIdType.investmentDeposit)) {
    temp.txId_type = [...temp.txId_type, Enum.walletTxIdType.investmentWithdrawal];
  }

  dataControl.value = {
    coinCd: temp.coin_Cd.length > 0 ? temp.coin_Cd : Object.values(coinList.value).map((e) => e.value),
    userType: temp.user_type.length > 0 ? temp.user_type : getWalletUserType(t).map((e) => e.value),
    dealType: temp.deal_type.length > 0 ? temp.deal_type : getWalletDealType(t).map((e) => e.value),
    txIdType:
      temp.txId_type.length > 0
        ? temp.txId_type
        : getWalletTxIdType(t)
            .map((e) => e.request)
            .flat(),
    dealState: temp.deal_State.length > 0 ? temp.deal_State : getWalletTransactionState(t).map((e) => e.value),
    search: temp.search,
    processStartDate: temp.processDate[0],
    processEndDate: temp.processDate[1],
  };
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

onBeforeMount(() => {
  if (isWallet.value || isPartner.value) {
    columns = columns.filter((e) => !e.hidden);
  }
});
</script>
