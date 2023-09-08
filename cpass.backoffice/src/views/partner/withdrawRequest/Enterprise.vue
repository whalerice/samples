<template>
  <PartnerPaymentSearch @search="getSearchData" :type="['partner.enterprise.withdrawal', 'req', 'pro', 'search']" />

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
    id="enterprise-withdraw"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.user_withdrawal_request_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
        <DownloadCSV :csvFile="csvFile" :filename="$t('datatable.title.user_withdrawal_request_list')" />
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
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'actual' &&
            column.dataIndex !== 'addr'
          "
          >{{ text }}</span
        >
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">{{
        matchingCurrencySymbol(record?.currency_Type)
      }}</template>
      <template v-if="column.dataIndex === 'price'">
        {{ comma(record.price) }}
      </template>
      <template v-if="column.dataIndex === 'state'">
        <template v-if="record.state === 0">
          <a-button danger @click="stateChangeBtn('refusal', record)" size="small" shape="round">{{
            t('datatable.text.refusal')
          }}</a-button>
          <a-button type="primary" @click="stateChangeBtn('approval', record)" size="small" shape="round">{{
            t('datatable.text.approval')
          }}</a-button>
        </template>
        <a-typography-text
          :class="{ 'display-none': record.state === 0 }"
          :type="record.state === 2 ? 'success' : record.state === 0 ? 'warning' : 'danger'"
          >{{
            record.state === 2
              ? t('datatable.text.completed')
              : record.state === 0
              ? t('datatable.text.request')
              : record.state === 3
              ? t('datatable.text.cancelled_store')
              : record.state === 4
              ? t('datatable.text.expire')
              : t('datatable.text.cancelled_user')
          }}</a-typography-text
        >
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <div style="align-items: center">
          <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
          <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
        </div>
      </template>
    </template>
  </a-table>

  <InvoicePreview
    :active="invoiceActive"
    :data="invoiceData"
    @returnInvoice="returnInvoice()"
    @close="toggleInvoice()"
  />
</template>

<script setup>
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import InvoicePreview from '@/components/modals/InvoicePreview.vue';
import DownloadCSV from '@/components/common/DownloadCSV.vue';
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { notification } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import { comma, deepCopy, lottieModal, matchingCurrencySymbol } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';
import PartnerPaymentSearch from '@/components/search/PartnerPaymentSearch.vue';

const { t } = useI18n();
const store = useStore();
const invoiceActive = ref(false);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const signInfo = computed(() => store.state['sign'].signInfo);
const withdrawStateMsg = computed(() => store.state['partner'].withdrawStateMsg);
const partnerWithdrawalRequestListPush = computed(() => store.state['partner'].partnerWithdrawalRequestListPush);
const partnerWithdrawStateChange = computed(() => store.state['partner'].partnerWithdrawStateChange);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const otpVerify = computed(() => store.state['otp'].otpVerify);
const checkAll = ref({ value: '', label: 'search.select.all', checked: true });
const csvFile = ref();

let invoiceData = ref({});

const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  state: '0,1,2,3',
  searchType: 1,
  search: '',
});

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
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
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
    key: 'currency_Type',
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
    className: 'btn-cell',
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
    req_BeforeDate: dataControl.value.req_BeforeDate,
    req_AfterDate: dataControl.value.req_AfterDate,
    proc_BeforeDate: dataControl.value.proc_BeforeDate,
    proc_AfterDate: dataControl.value.proc_AfterDate,
    state: dataControl.value.state,
    search_Type: dataControl.value.searchType,
    search: dataControl.value.search,
    order: order,
    sort: sort,
  });

  const csv = await apis.PartnerWithdrawalRequestListPush({
    currentPage: 0,
    currentPageSize: params.results,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    req_AfterDate: dataControl.value.req_AfterDate,
    proc_BeforeDate: dataControl.value.proc_BeforeDate,
    proc_AfterDate: dataControl.value.proc_AfterDate,
    state: dataControl.value.state,
    search_Type: dataControl.value.searchType,
    search: dataControl.value.search,
    order: order,
    sort: sort,
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

const handleResizeColumn = (w, col) => {
  col.width = w;
};

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const toggleInvoice = () => {
  invoiceActive.value = !invoiceActive.value;
};

const stateChangeBtn = (type, val) => {
  invoiceData.value = val;
  invoiceData.value.type = type;
  toggleInvoice();
};

const returnInvoice = async () => {
  toggleInvoice();

  await store.dispatch('partner/PartnerWithdrawStateChange', {
    deal_Id: invoiceData.value.confirmation_Number,
    approve_YN: invoiceData.value.type === 'approval' ? 1 : 0,
    approver_Sn: signInfo.value.sn,
    approver_Grade: signInfo.value.grade,
    signature: [`${otpVerify.value.returnData.signature}`],
  });

  if (partnerWithdrawStateChange.value.errCode === 0) {
    lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
  store.commit('partner/SET_PARTNER_WITHDRAW_STATE_CHANGE', {});
};

const openNotification = (val) => {
  notification['success']({
    message: 'Success',
    description: val,
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
      e.processing_Date,
      e.cpass_Id,
      e.partner_Member_Id,
      matchingCurrencySymbol(e.currency_Type),
      e.price,
      e.state === 1
        ? t('datatable.text.request')
        : e.state === 2
        ? t('datatable.text.approval')
        : t('datatable.text.refusal'),
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

const getSearchData = (searchData) => {
  const temp = deepCopy(searchData);
  dataControl.value = deepCopy({
    req_BeforeDate: temp.req_BeforeDate,
    req_AfterDate: temp.req_AfterDate,
    proc_BeforeDate: temp.proc_BeforeDate,
    proc_AfterDate: temp.proc_AfterDate,
    state: temp.PartnerEnterpriseWithdrawal,
    searchType: temp.searchType,
    search: temp.search,
  });

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(withdrawStateMsg, (val) => {
  openNotification(val.returnData);
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
});
</script>
