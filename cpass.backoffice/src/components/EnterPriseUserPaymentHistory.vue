<template>
  <FilterContainer
    class="mb-10 filter-container advanced-search-width-40"
    :data="filterData"
    :button="buttonData"
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
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
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
            column.dataIndex !== 'addr'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'state'">
        <template v-if="record.state === 0">
          <span>{{ $t('datatable.text.request') }}</span>
        </template>
        <a-typography-text v-else :type="record.state === 2 ? 'success' : record.state === 3 ? 'warning' : 'danger'">
          {{
            record.state === 1
              ? $t('datatable.text.cancelled_user')
              : record.state === 2
              ? $t('datatable.text.completed')
              : $t('datatable.text.cancelled_store')
          }}
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
    </template>
  </a-table>
</template>
<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy, matchingCoinLabel, matchingCurrencySymbol } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const coinList = computed(() => store.state['sign'].coinList);
const userPaymentConfirmMsg = computed(() => store.state['partner'].userPaymentConfirmMsg);
const csMasterPartnerPaymentRequestListPush = computed(
  () => store.state['manager'].csMasterPartnerPaymentRequestListPush
);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const errCode = computed(() => store.state['common'].errCode);
const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  searchType: 1,
  search: '',
  state: '0,1,2,3',
  coins: '1,2,3,4,6,7',
});
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_id',
    dataIndex: 'partner_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_name',
    dataIndex: 'partner_Name',
    sorter: true,
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.store_id',
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
  },
  {
    title: 'datatable.thead.settlement_amount',
    dataIndex: 'settlement_amount',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr_tag',
    dataIndex: 'addr',
    sorter: true,
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
    CurrentPage: params.page,
    CurrentPageSize: params.results,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    req_AfterDate: dataControl.value.req_AfterDate,
    proc_BeforeDate: dataControl.value.proc_BeforeDate,
    proc_AfterDate: dataControl.value.proc_AfterDate,
    Coin_Cd: dataControl.value.coins,
    Search_Type: dataControl.value.searchType,
    Search: dataControl.value.search,
    state: dataControl.value.state,
    Order: order,
    Sort: sort,
  };

  try {
    await store.dispatch('manager/CSmasterPaymentRequestListPush', data);
    if (errCode.value === 0) {
      const count = csMasterPartnerPaymentRequestListPush.value.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return csMasterPartnerPaymentRequestListPush.value.list;
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
// const onConfirm = async (code) => {
//   await store.dispatch('partner/paymentConfirm', { ApprovalCode: code });
// };
const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  })
);
const selectOption = ref([
  { value: 0, label: () => t('search.label.request'), checked: false },
  { value: 1, label: () => t('search.label.cancelled_user'), checked: false },
  { value: 2, label: () => t('search.label.completed'), checked: false },
  { value: 3, label: () => t('search.label.cancelled_store'), checked: false },
]);
const rangePickerOption = ref([
  {
    value: 1,
    label: () => {
      return t('search.button.today');
    },
  },
  {
    value: 7,
    label: () => {
      return t('search.button.days', { num: 7 });
    },
  },
  {
    value: 30,
    label: () => {
      return t('search.button.days', { num: 30 });
    },
  },
]);
const searchOption = ref([
  { value: 1, label: () => t('search.select.id'), checked: true },
  { value: 2, label: () => t('search.select.store_id'), checked: false },
  { value: 3, label: () => t('search.select.confirmation_number'), checked: false },
  { value: 4, label: () => t('search.select.partner_name'), checked: false },
  { value: 5, label: () => t('search.select.partner_id'), checked: false },
]);
const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    data: rangePickerOption.value,
    placeHolder: () => t('search.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'processingDate',
    data: rangePickerOption.value,
    placeHolder: () => t('search.label.processing_date'),
    order: 2,
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
    type: 'select',
    name: 'state',
    data: selectOption.value,
    order: 3,
    placeHolder: () => {
      return t('datatable.thead.state');
    },
  },
  {
    type: 'search',
    name: 'search',
    data: searchOption.value,
    search: '',
    order: 5,
    placeHolder: () => {
      return t('search.placeholder.search_text');
    },
  },
];
const buttonData = {
  label: [() => t('common.label.filter_close'), () => t('common.label.filter_open')],
};
const getFilterData = (val) => {
  const temp = deepCopy(val);

  const defaultState = '0,1,2,3';
  const defaultCoin = Object.values(coinList.value)
    .map((e) => e.value)
    .join(',');

  dataControl.value = {
    req_BeforeDate: temp.requestDate[0],
    req_AfterDate: temp.requestDate[1],
    proc_BeforeDate: temp.processingDate[0],
    proc_AfterDate: temp.processingDate[1],
    coins: temp.coin.length === 0 ? defaultCoin : temp.coin.join(','),
    state: temp.state.length === 0 ? defaultState : temp.state.join(','),
    searchType: temp.search.select.value,
    search: temp.search.search,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(userPaymentConfirmMsg, (val) => {
  showConfirm(val);
});
</script>
