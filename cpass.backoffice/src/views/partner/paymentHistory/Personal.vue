<template>
  <SendPushForm @page="returnSendPushForm" :type="'payment'" />
  <div class="mb-15"></div>
  <PartnerPaymentSearch @search="getSearchData" :type="['state', 'coin', 'req', 'pro', 'search']" />
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
    id="personal-payment"
  >
    <template #headerCell="{ title }"> {{ t(title) }}</template>
    <template #title>
      <h4 class="title">
        <span class="text">{{ t('datatable.title.user_payment_information_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
        <DownloadCSV :csvFile="csvFile" :filename="t('datatable.title.user_payment_information_list')" />
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
        <span
          v-if="
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'currency_Type'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'price'">
        {{ comma(record.price) }}
      </template>

      <template v-if="column.dataIndex === 'state'">
        <template v-if="record.state === 0">
          <a-button type="primary" size="small" shape="round" @click="stateChangeBtn('resend', record)">{{
            t('common.button.resend')
          }}</a-button>
          <a-button type="danger" size="small" shape="round" @click="stateChangeBtn('cancel', record)">{{
            t('common.button.cancel')
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
        <template v-if="record.state === 2">
          <a-button
            v-if="!record.isConfirm"
            type="primary"
            size="small"
            shape="round"
            @click="stateChangeBtn('confirm', record)"
            >{{ t('common.button.confirm') }}</a-button
          >
        </template>
      </template>

      <template v-if="column.dataIndex === 'settlement_Amount Amount'">
        {{ comma(record.settlement_Amount) }}
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <span style="align-items: center">
          <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
          <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
        </span>
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        {{ matchingCurrencySymbol(record?.currency_Type) }}
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        {{ matchingCoinLabel(record?.coin_Cd) }}
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
import InvoicePreview from '@/components/modals/InvoicePreview.vue';
import DownloadCSV from '@/components/common/DownloadCSV.vue';
import PartnerPaymentSearch from '@/components/search/PartnerPaymentSearch.vue';
import SendPushForm from '@/components/partner/SendPushForm.vue';

import { Modal } from 'ant-design-vue';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy, lottieModal, matchingCoinLabel, matchingCurrencySymbol } from '@/assets/js/global.js';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { notification } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const invoiceActive = ref(false);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const errMessage = computed(() => store.state['common'].errMessage);
const userPaymentConfirmMsg = computed(() => store.state['partner'].userPaymentConfirmMsg);
const coin_cd = computed(() => store.state['sign'].coin_cd);
const paymentRequestPayAgain = computed(() => store.state['partner'].paymentRequestPayAgain);
const otpVerify = computed(() => store.state['otp'].otpVerify);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const paymentRequestConfirm = computed(() => store.state['partner'].paymentRequestConfirm);
const paymentVerifyAccount = computed(() => store.state['partner'].paymentVerifyAccount);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const paymentDeclineApp = computed(() => store.state['partner'].paymentDeclineApp);

let invoiceData = ref({});

const dataControl = ref({
  state: '0,1,2,3,4',
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  coin: '1,2,3,4,6,7',
  search: '',
  searchType: 1,
});

const csvFile = ref();

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    key: 'request_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
    key: 'processing_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    key: 'cpass_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.store_id',
    dataIndex: 'partner_Member_Id',
    key: 'partner_Member_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.order_name',
    dataIndex: 'order_Name',
    key: 'order_Name',
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
    className: 'btn-cell exclude-csv',
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
    title: 'datatable.thead.settlement_amount',
    dataIndex: 'settlement_Amount',
    key: 'settlement_Amount',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr_tag',
    dataIndex: 'addr',
    key: 'addr',

    sorter: true,
  },
  {
    title: 'datatable.thead.confirmation_number',
    dataIndex: 'confirmation_Number',
    key: 'confirmation_Number',
    sorter: true,
  },
]);
const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};

const queryData = async (params) => {
  let sort =
    params.sortOrder !== undefined && params.sortOrder === 'ascend'
      ? 'asc'
      : params.sortOrder !== undefined && params.sortOrder === 'descend'
      ? 'desc'
      : '';
  let order = params.sortOrder === undefined ? '' : params.sortField;

  const data = {
    currentPage: params.page,
    currentPageSize: params.results,
    beforeDate: dataControl.value.beforeDate,
    afterDate: dataControl.value.afterDate,
    coin_Cd: dataControl.value.coin,
    search_Type: String(dataControl.value.searchType),
    search: dataControl.value.search,
    order: order,
    sort: sort,
    state: dataControl.value.state,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    req_AfterDate: dataControl.value.req_AfterDate,
    proc_BeforeDate: dataControl.value.proc_BeforeDate,
    proc_AfterDate: dataControl.value.proc_AfterDate,
  };

  try {
    const response = await apis.PartnerPaymentRequestListPush(data);
    const csv = await apis.PartnerPaymentRequestListPush({
      currentPage: 0,
      currentPageSize: params.results,
      beforeDate: dataControl.value.beforeDate,
      afterDate: dataControl.value.afterDate,
      coin_Cd: dataControl.value.coin,
      search_Type: String(dataControl.value.searchType),
      search: dataControl.value.search,
      order: order,
      sort: sort,
      state: dataControl.value.state,
      req_BeforeDate: dataControl.value.req_BeforeDate,
      req_AfterDate: dataControl.value.req_AfterDate,
      proc_BeforeDate: dataControl.value.proc_BeforeDate,
      proc_AfterDate: dataControl.value.proc_AfterDate,
    });
    if (response?.data.errCode === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      getCSV(csv.data.returnData.list);
      return response.data.returnData.list;
    }
  } catch (error) {
    console.error(error);
  }
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
      e.order_Name,
      matchingCurrencySymbol(e.currency_Type),
      e.price,
      e.state === 'Completed'
        ? t('datatable.text.completed')
        : e.state === 'Request'
        ? t('datatable.text.request')
        : e.state === 'Cancelled(Store)'
        ? t('datatable.text.cancelled_store')
        : t('datatable.text.cancelled_user'),
      matchingCoinLabel(e.coin_Cd),
      e.amount,
      e.settlement_Amount,
      e.addr,
      e.confirmation_Number,
    );
    csv.push(row.join(','));
  });
  csvFile.value = csv.join('\n');
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

const returnSendPushForm = () => {
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const stateChangeBtn = (type, val) => {
  invoiceData.value = val;
  invoiceData.value.type = type;
  toggleInvoice();
};

const toggleInvoice = () => {
  invoiceActive.value = !invoiceActive.value;
};
const returnInvoice = async () => {
  toggleInvoice();

  if (invoiceData.value.type === 'cancel') {
    await store.dispatch('partner/PaymentDeclineApp', {
      request_Idx: invoiceData.value.request_Idx,
      deal_Id: Number(invoiceData.value.confirmation_Number),
      signature: [`${otpVerify.value.returnData.signature}`],
    });
    if (paymentDeclineApp.value.errCode === 0) {
      lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(errMessage, 'error');
    }
  } else if (invoiceData.value.type === 'resend') {
    const verifyResult = await verifyAccount(invoiceData.value.cpass_Id);
    if (verifyResult) {
      await store.dispatch('partner/PaymentRequestPayAgain', {
        orderNumber: invoiceData.value.order_Number,
        signature: invoiceData.value.signature,
      });

      const errCode = paymentRequestPayAgain.value.errCode;
      const errMessage = paymentRequestPayAgain.value.errMessage;

      if (errCode === 0) {
        lottieModal(t('confirm.title.success_sended'), 'send', 1.5);
        handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
      } else {
        openNotification(errMessage, 'error');
      }
    } else {
      openNotification(errMessage, 'error');
    }
  } else if (invoiceData.value.type === 'confirm') {
    await store.dispatch('partner/PaymentRequestConfirm', {
      idx: invoiceData.value.request_Idx,
    });

    const errCode = paymentRequestConfirm.value.errCode;
    const errMessage = paymentRequestConfirm.value.errMessage;

    if (errCode === 0) {
      lottieModal(t('component.title.success_confirm'), 'setting', 1.5);
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(errMessage, 'error');
    }
  }
};

const getSearchData = (searchData) => {
  const temp = deepCopy(searchData);

  dataControl.value = deepCopy({
    state: temp.state,
    req_BeforeDate: temp.req_BeforeDate,
    req_AfterDate: temp.req_AfterDate,
    proc_BeforeDate: temp.proc_BeforeDate,
    proc_AfterDate: temp.proc_AfterDate,
    coin: temp.coin,
    search: temp.search,
    searchType: temp.searchType,
  });
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const verifyAccount = async (val) => {
  await store.dispatch('partner/PaymentVerifyAccount', {
    userId: val,
    partnerCode: partnerInfo.value.partner_Code,
  });

  const errCode = paymentVerifyAccount.value.errCode;

  if (errCode === 0 && paymentVerifyAccount.value.returnData.paymentToken !== null) {
    return true;
  } else {
    return false;
  }
};
watch(userPaymentConfirmMsg, (val) => {
  showConfirm(val);
});

onBeforeMount(async () => {
  await store.dispatch('sign/coinList');
  await store.dispatch('sign/partnerWalletInfo');
});
</script>
