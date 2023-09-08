<template>
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
    id="personal-payment"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ t('component.title.recent_history') }}</span>
      </h4>
    </template>
    <template #headerCell="{ title }"> {{ t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'request_Step' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'currency_Type' &&
            column.dataIndex !== 'payment_Type'
          "
          >{{ text }}</span
        >
      </template>

      <template v-if="column.dataIndex === 'price'">
        {{ comma(record.price) }}
      </template>
      <template v-if="column.dataIndex === 'request_Step'">
        <template v-if="record.payment_Type === 1">
          <template v-if="record.request_Step === 0">
            <a-button type="primary" size="small" shape="round" @click="stateChangeBtn('resend', record)">{{
              t('common.button.resend')
            }}</a-button>
            <a-button type="danger" size="small" shape="round" @click="stateChangeBtn('cancel', record)">{{
              t('common.button.cancel')
            }}</a-button>
          </template>
          <a-typography-text
            :class="{ 'display-none': record.request_Step === 0 }"
            :type="record.request_Step === 2 ? 'success' : record.request_Step === 0 ? 'warning' : 'danger'"
            >{{
              record.request_Step === 2
                ? t('datatable.text.completed')
                : record.request_Step === 0
                ? t('datatable.text.request')
                : record.request_Step === 3
                ? t('datatable.text.cancelled_store')
                : record.request_Step === 4
                ? t('datatable.text.expire')
                : t('datatable.text.cancelled_user')
            }}</a-typography-text
          >
          <template v-if="record.request_Step === 2">
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
        <template v-if="record.payment_Type === 2">
          <a-typography-text
            :type="record.request_Step === 2 ? 'success' : record.request_Step === 0 ? 'warning' : 'danger'"
            >{{
              record.request_Step === 2
                ? t('datatable.text.completed')
                : record.request_Step === 0
                ? t('datatable.text.request')
                : record.request_Step === 3
                ? t('datatable.text.cancelled_store')
                : record.request_Step === 4
                ? t('datatable.text.expire')
                : t('datatable.text.cancelled_user')
            }}</a-typography-text
          >
        </template>
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        {{ matchingCurrencySymbol(record?.currency_Type) }}
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        {{ matchingCoinLabel(record?.coin_Cd) }}
      </template>
      <template v-if="column.dataIndex === 'payment_Type'">
        {{
          propsSortation === undefined
            ? record?.payment_Type === 1
              ? t('search.select.deposit')
              : t('search.select.withdrawal')
            : ''
        }}
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

import { Modal } from 'ant-design-vue';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, lottieModal, matchingCoinLabel, matchingCurrencySymbol } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { notification } from 'ant-design-vue';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  index: {
    type: Number,
    required: false,
  },
  search: {
    type: String,
    required: false,
  },
});
const propsSortation = computed(() => props.index);
const invoiceActive = ref(false);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const errCode = computed(() => store.state['common'].errCode);
const userPaymentConfirmMsg = computed(() => store.state['partner'].userPaymentConfirmMsg);
const paymentRequestPayAgain = computed(() => store.state['partner'].paymentRequestPayAgain);
const paymentRequestConfirm = computed(() => store.state['partner'].paymentRequestConfirm);
const otpVerify = computed(() => store.state['otp'].otpVerify);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const headerInfo = computed(() => store.state['partner'].headerInfo.recentPaymentList);
const headerModalInfo = computed(() => store.state['partner'].headerModalInfo?.recentPaymentList);
let invoiceData = ref({});
const paymentVerifyAccount = computed(() => store.state['partner'].paymentVerifyAccount);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const paymentDeclineApp = computed(() => store.state['partner'].paymentDeclineApp);
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    key: 'request_Date',
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
    key: 'processing_Date',
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'user_Id',
    key: 'user_Id',
  },
  {
    title: 'datatable.thead.store_id',
    dataIndex: 'partner_Member_Id',
    key: 'partner_Member_Id',
  },
  {
    title: 'datatable.thead.order_name',
    dataIndex: 'order_Name',
    key: 'order_Name',
  },
  {
    title: 'datatable.thead.currency',
    dataIndex: 'currency_Type',
    key: 'currency_Type',
  },
  {
    title: 'datatable.thead.price',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'request_Step',
    key: 'request_Step',
    className: 'btn-cell',
  },
]);

const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};

const queryData = async (params) => {
  try {
    if (propsSortation.value === undefined) {
      await store.dispatch('partner/PartnerPaymentRecentPaymentList', {
        user_Sn: 0,
        payment_Type: 0,
      });
      if (headerInfo.value.errCode === 0) return headerInfo.value.returnData;
    } else {
      await store.dispatch('partner/PartnerPaymentRecentPaymentListModal', {
        user_Sn: 0,
        payment_Type: propsSortation.value,
      });
      if (headerModalInfo.value.errCode === 0) return headerModalInfo.value.returnData;
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
});
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
      request_Idx: invoiceData.value.payment_Idx,
      deal_Id: Number(invoiceData.value.deal_Id),
      signature: [`${otpVerify.value.returnData.signature}`],
    });

    if (paymentDeclineApp.value.errCode === 0) {
      lottieModal(t('confirm.description.success_saved'), 'setting', 1.5);
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(errMessage, 'error');
    }
  } else if (invoiceData.value.type === 'resend') {
    const verifyResult = await verifyAccount(invoiceData.value.user_Id);

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
      idx: invoiceData.value.payment_Idx,
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

watch(headerInfo, (val) => {
  if (propsSortation.value === undefined) {
    dataSource.value = val.returnData;
  }
});

watch(headerModalInfo, (val) => {
  if (propsSortation.value !== undefined) {
    dataSource.value = val.returnData;
  }
});

onBeforeMount(async () => {
  if (propsSortation.value === undefined) {
    columns.value.splice(2, 0, {
      title: 'datatable.thead.sortation',
      dataIndex: 'payment_Type',
      key: 'payment_Type',
    });
  }
});
</script>
