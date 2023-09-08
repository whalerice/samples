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
      <h4 class="title">
        {{ $t('datatable.title.user_payment_information_list') }}
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
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'settlement_amount' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'currency_Type' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'price'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'state'">
        <template v-if="record.state === Enum.depositStateType.Request">
          <span>{{ $t('datatable.text.request') }}</span>
        </template>
        <a-typography-text :type="getDepositStateType(t, record.state)?.color" v-else>
          {{ getDepositStateType(t, record.state)?.label() }}
        </a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }} </template>
      <template v-if="column.dataIndex === 'settlement_amount'">
        {{ comma(record.settlement_Amount) }}
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
        <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'"> {{ matchingCoinLabel(record.coin_Cd) }} </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        {{ matchingCurrencySymbol(record.currency_Type) }}
      </template>
      <template v-if="column.dataIndex === 'price'">
        {{ comma(text) }}
      </template>
    </template>
  </a-table>
</template>
<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { usePagination } from 'vue-request';
import { Enum } from '@/assets/js/enum';
import { comma, deepCopy, matchingCoinLabel, matchingCurrencySymbol, getDepositStateType } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isPartner = computed(() => props.type === 'partner');
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const coinList = computed(() => store.state['sign'].coinList);
const userPaymentConfirmMsg = computed(() => store.state['partner'].userPaymentConfirmMsg);
const CSmasterPaymentPartnerDepositList = computed(() => store.state['manager'].cSmasterPaymentPartnerDepositList);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const errCode = computed(() => store.state['common'].errCode);

const defaultState = getDepositStateType(t).map((e) => e.value);
const defaultCoin = Object.values(coinList.value).map((e) => e.value);
const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  search: '',
  state: defaultState,
  coins: defaultCoin,
});

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const columns = ref([
  {
    title: 'common.label.request_date',
    dataIndex: 'request_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.processed_date',
    dataIndex: 'processing_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_id',
    dataIndex: 'partner_Id',
    sorter: true,
    partner: true,
  },
  {
    title: 'datatable.thead.partner_name',
    dataIndex: 'partner_Name',
    sorter: true,
    partner: true,
  },
  {
    title: 'datatable.label.user_id',
    dataIndex: 'cpass_Id',
    sorter: true,
  },
  {
    title: 'datatable.label.user_store_id',
    dataIndex: 'store_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.order_name',
    dataIndex: 'order_Name',
    sorter: true,
  },
  {
    title: 'datatable.thead.currency',
    dataIndex: 'currency_Type',
    sorter: true,
  },
  {
    title: 'datatable.thead.price',
    dataIndex: 'price',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    className: 'btn-cell',
    sorter: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    sorter: true,
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'settlement_Fee',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.settlement_amount',
    dataIndex: 'settlement_amount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.addr_tag',
    dataIndex: 'addr',
    sorter: true,
    className: 'btn-cell',
  },
  {
    title: 'datatable.thead.confirmation_number',
    dataIndex: 'confirmation_Number',
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
    requestStartDate: dataControl.value.req_BeforeDate,
    requestEndDate: dataControl.value.req_AfterDate,
    processStartDate: dataControl.value.proc_BeforeDate,
    processEndDate: dataControl.value.proc_AfterDate,
    coinCd: dataControl.value.coins,
    search: dataControl.value.search,
    state: dataControl.value.state,
    Order: order,
    Sort: sort,
  };

  try {
    await store.dispatch('manager/CSmasterPaymentPartnerDepositList', data);
    if (errCode.value === 0) {
      const count = CSmasterPaymentPartnerDepositList.value.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return CSmasterPaymentPartnerDepositList.value.list;
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

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isPartner.value ? 'small' : '',
}));

const showConfirm = (e) => {
  if (e.errCode === 0) {
    Modal.success({
      title: e.returnData,
      onOk() {
        handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
      },
    });
  } else {
    Modal.error({
      title: e.errMessage,
      onOk() {
        handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
      },
    });
  }
};

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

const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);
const selectOption = ref(getDepositStateType(t));
const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('common.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'processingDate',
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
    name: 'totalSearch',
    order: 5,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.manager_partner_deposit');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const getFilterData = (val) => {
  const temp = deepCopy(val);

  dataControl.value = {
    req_BeforeDate: temp.requestDate[0],
    req_AfterDate: temp.requestDate[1],
    proc_BeforeDate: temp.processingDate[0],
    proc_AfterDate: temp.processingDate[1],
    coins: temp.coin.length === 0 ? defaultCoin : temp.coin,
    state: temp.state.length === 0 ? defaultState : temp.state,
    search: temp.totalSearch,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(userPaymentConfirmMsg, (val) => {
  showConfirm(val);
});

onBeforeMount(() => {
  if (isPartner.value) {
    columns.value = columns.value.filter((e) => !e.partner);
  }
});
</script>
