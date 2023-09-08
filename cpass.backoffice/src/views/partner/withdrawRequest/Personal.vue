<template>
  <SendPushForm @page="returnSendPushForm" :type="'withdraw'" />
  <div class="mb-15"></div>
  <PartnerPaymentSearch @search="getSearchData" :type="['req', 'search']" />
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
    id="personal-withdraw"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ t('datatable.title.user_withdrawal_request_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
        <DownloadCSV :csvFile="csvFile" :filename="t('datatable.title.user_withdrawal_request_list')" />
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
    <template #headerCell="{ title }"> {{ t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'currency' &&
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'actual' &&
            column.dataIndex !== 'fee' &&
            column.dataIndex !== 'addr'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'currency_Type'">{{
        matchingCurrencySymbol(record?.currency_Type)
      }}</template>
      <template v-if="column.dataIndex === 'price'">{{ comma(record.price) }} </template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }} </template>
      <template v-if="column.dataIndex === 'actual'">{{ comma(record.actual) }} </template>
      <template v-if="column.dataIndex === 'fee'">{{ comma(record.fee) }} </template>
      <template v-if="column.dataIndex === 'addr'">
        <div style="align-items: center">
          <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
          <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
        </div>
      </template>

      <template v-if="column.dataIndex === 'state'">
        <!-- :class="{ 'display-none': record.state === 0 }" -->
        <a-typography-text :type="record.state === 2 ? 'success' : record.state === 0 ? 'warning' : 'danger'">{{
          record.state === 2
            ? t('datatable.text.completed')
            : record.state === 0
            ? t('datatable.text.request')
            : record.state === 3
            ? t('datatable.text.cancelled_store')
            : record.state === 4
            ? t('datatable.text.expire')
            : t('datatable.text.cancelled_user')
        }}</a-typography-text>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import DownloadCSV from '@/components/common/DownloadCSV.vue';
import PartnerPaymentSearch from '@/components/search/PartnerPaymentSearch.vue';
import SendPushForm from '@/components/partner/SendPushForm.vue';

import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { notification } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { comma, deepCopy, matchingCurrencySymbol } from '@/assets/js/global.js';
import { apis } from '@/store/api';

const { t } = useI18n();
const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const withdrawStateMsg = computed(() => store.state['partner'].withdrawStateMsg);
const partnerWithdrawalRequestListPush = computed(() => store.state['partner'].partnerWithdrawalRequestListPush);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  searchType: 1,
  search: '',
});

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const csvFile = ref();

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.store_id',
    dataIndex: 'partner_Member_Id',
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
    key: 'price',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    className: 'btn-cell exclude-csv',
    sorter: true,
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'fee',
    align: 'right',
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
    key: 'confirm',
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

  await store.dispatch('partner/PartnerWithdrawalRequestListPush', {
    currentPage: params.page,
    currentPageSize: params.results,
    order: order,
    proc_AfterDate: '',
    proc_BeforeDate: '',
    req_AfterDate: dataControl.value.req_AfterDate,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    search: dataControl.value.search,
    search_Type: dataControl.value.searchType,
    sort: sort,
    state: '0,1,2,3',
  });
  const csv = await apis.PartnerWithdrawalRequestListPush({
    currentPage: 0,
    currentPageSize: params.results,
    order: order,
    proc_AfterDate: '',
    proc_BeforeDate: '',
    req_AfterDate: dataControl.value.req_AfterDate,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    search: dataControl.value.search,
    search_Type: dataControl.value.searchType,
    sort: sort,
    state: '0,1,2,3',
  });

  if (partnerWithdrawalRequestListPush.value.totalCount) {
    totalCount.value = partnerWithdrawalRequestListPush.value.totalCount.count;
  }
  getCSV(csv.data.returnData.list);
  return partnerWithdrawalRequestListPush.value.list;
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

const getCSV = (data) => {
  var csv = [];
  var row = [];

  columns.value.forEach((e) => {
    row.push(t(e.title));
  });
  csv.push(row.join(','));

  data.forEach((e) => {
    row = [];
    row.push(
      e.request_Date,
      e.cpass_Id,
      e.partner_Member_Id,
      matchingCurrencySymbol(e.currency_Type),
      e.price,
      e.amount,
      e.actual,
      e.fee,
      e.addr,
      e.confirmation_Number,
    );
    csv.push(row.join(','));
  });
  csvFile.value = csv.join('\n');
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

const returnSendPushForm = () => {
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const getSearchData = (searchData) => {
  const temp = deepCopy(searchData);

  dataControl.value = deepCopy({
    req_BeforeDate: temp.req_BeforeDate,
    req_AfterDate: temp.req_AfterDate,
    searchType: temp.searchType,
    search: temp.search,
  });
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(withdrawStateMsg, (val) => {
  openNotification(val.returnData);
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
});
onBeforeMount(async () => {
  await store.dispatch('sign/partnerWalletInfo');
});
</script>
