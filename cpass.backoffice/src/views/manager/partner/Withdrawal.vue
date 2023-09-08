<template>
  <FilterContainer v-if="!isPartner" class="mb-10 filter-container" :data="filterData" @getData="getFilterData" />
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
    <template #title v-if="!isPartner">
      <h4 class="title">{{ $t('datatable.title.users_withdrawal_request_list') }}</h4>
      <div class="control-box">
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
        <a-select v-model:value="selectedPageSize" label-in-value :options="pageSizeOptions" @change="selectPageSize" />
      </div>
    </template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'approvalDate' &&
            column.dataIndex !== 'currency_Type' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'actual'
          "
          >{{ text }}</span
        ></template
      >
      <template v-if="column.dataIndex === 'approvalDate'">
        <span>{{ record.approvalDate ? record.approvalDate : 'ー' }}</span>
      </template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }}</template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-text
          v-if="record.state === 2 || record.state === 3"
          :type="record.state === 2 ? 'success' : 'danger'"
          >{{ record.state === 2 ? $t('datatable.text.approval') : $t('datatable.text.refusal') }}</a-typography-text
        >
        <span v-else>{{ $t('datatable.text.request') }}</span>
      </template>
      <template v-if="column.dataIndex === 'actual'">{{ comma(record.actual) }} </template>
      <template v-if="column.dataIndex === 'fee'">{{ comma(record.fee) }} </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        {{ matchingCoinLabel(text) }}
      </template>
      <template v-if="column.dataIndex === 'currency_Money'">
        {{ comma(text) }}
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        {{ matchingCurrencySymbol(text) }}
      </template>
    </template>
  </a-table>
</template>

<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { notification } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { CSmasterWithdrawalRequestList } from '@/store/api';
import {
  comma,
  deepCopy,
  matchingCoinLabel,
  matchingCurrencySymbol,
  getPartnerWithdrawStateType,
} from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isPartner = computed(() => props.type === 'partner');
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const withdrawStateMsg = computed(() => store.state['partner'].withdrawStateMsg);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const coinList = computed(() => store.state['sign'].coinList);
const isMobile = ref(isDeviceMobile.value);
const defaultCoin = Object.values(coinList.value).map((e) => e.value);
const defaultState = getPartnerWithdrawStateType(t).map((e) => e.value);
const dataControl = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  state: defaultState,
  search: '',
  coin_Cd: defaultCoin,
});
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isPartner.value ? 'small' : '',
}));

const columns = ref([
  {
    title: 'common.label.request_date',
    dataIndex: 'requestDate',
    key: 'requestDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.processed_date',
    dataIndex: 'approvalDate',
    key: 'approvalDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_id',
    dataIndex: 'partnerId',
    key: 'partnerId',
    sorter: true,
    partner: true,
  },
  {
    title: 'datatable.thead.partner_name',
    dataIndex: 'partner_Name',
    key: 'partner_Name',
    sorter: true,
    partner: true,
  },
  {
    title: 'datatable.label.user_id',
    dataIndex: 'user_Id',
    key: 'user_Id',
    sorter: true,
  },
  {
    title: 'datatable.label.user_store_id',
    dataIndex: 'storeId',
    key: 'storeId',
    sorter: true,
  },
  {
    title: 'datatable.thead.currency',
    dataIndex: 'currency_Type',
    key: 'currency_Type',
    sorter: true,
  },
  {
    title: 'component.label.price',
    dataIndex: 'currency_Money',
    key: 'currency_Money',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    className: 'btn-cell',
    width: '22rem',
    sorter: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    key: 'coin_Cd',
    sorter: true,
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'fee',
    key: 'fee',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    key: 'actual',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
    key: 'addr',
    sorter: true,
    className: 'btn-cell',
  },
  {
    title: 'datatable.thead.confirmation_number',
    dataIndex: 'approvalNumber',
    sorter: true,
  },
]);

const queryData = async (params) => {
  let sort =
    params.sortOrder !== undefined && params.sortOrder === 'ascend'
      ? 'asc'
      : params.sortOrder !== undefined && params.sortOrder === 'descend'
      ? 'desc'
      : '';
  let order = params.sortOrder === undefined ? '' : params.sortField;

  const data = {
    userSn: isPartner.value ? props.sn : null,
    CurrentPage: params.page,
    CurrentPageSize: params.results,
    requestStartDate: dataControl.value.requestBeforeDate,
    requestEndDate: dataControl.value.requestAfterDate,
    processStartDate: dataControl.value.concludeBeforeDate,
    processEndDate: dataControl.value.concludeAfterDate,
    State: dataControl.value.state,
    Search: dataControl.value.search,
    Order: order,
    Sort: sort,
    coinCd: dataControl.value.coin_Cd,
  };

  try {
    const response = await CSmasterWithdrawalRequestList(data);

    if (response?.data.errCode === 0) {
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
const openNotification = (val) => {
  notification['success']({
    message: t('notification.title.success'),
    description: val,
  });
};

const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);
const selectOption = ref(getPartnerWithdrawStateType(t));

const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('common.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'concludedDate',
    placeHolder: () => t('datatable.thead.processed_date'),
    order: 2,
  },
  {
    type: 'select',
    name: 'state',
    data: selectOption.value,
    order: 3,
    placeHolder: () => {
      return t('datatable.thead.state');
    },
  },
  {
    type: 'select',
    name: 'coin',
    data: coinOption.value,
    order: 4,
    placeHolder: () => {
      return t('search.label.coin');
    },
  },
  {
    type: 'totalSearch',
    name: 'search',
    search: '',
    order: 5,
    placeHolder: () => {
      return t('search.placeholder.manager_partner_withdrawal');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const getFilterData = (val) => {
  const temp = deepCopy(val);

  dataControl.value = {
    requestBeforeDate: temp.requestDate[0],
    requestAfterDate: temp.requestDate[1],
    concludeBeforeDate: temp.concludedDate[0],
    concludeAfterDate: temp.concludedDate[1],
    search: temp.search,
    coin_Cd: temp.coin.length === 0 ? defaultCoin : temp.coin,
    state: temp.state.length === 0 ? defaultState : temp.state,
  };
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(withdrawStateMsg, (val) => {
  openNotification(val.returnData);
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
});

onBeforeMount(() => {
  if (isPartner.value) {
    columns.value = columns.value.filter((e) => !e.partner);
  }
});
</script>
