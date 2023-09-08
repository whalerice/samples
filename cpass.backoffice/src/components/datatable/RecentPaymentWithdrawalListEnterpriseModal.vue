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
    id="enterprise-withdraw"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ t('component.title.recent_history') }}</span>
      </h4>
    </template>

    <template #headerCell="{ title }"> {{ $t(title) }}</template>

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
      <template v-if="column.dataIndex === 'currency_Type'">{{
        matchingCurrencySymbol(record?.currency_Type)
      }}</template>

      <template v-if="column.dataIndex === 'price'">
        {{ comma(record.price) }}
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

      <template v-if="column.dataIndex === 'request_Step'">
        <template v-if="record.payment_Type === 2">
          <template v-if="record.request_Step === 0">
            <a-button danger @click="stateChangeBtn('refusal', record)" size="small" shape="round">{{
              t('datatable.text.refusal')
            }}</a-button>
            <a-button type="primary" @click="stateChangeBtn('approval', record)" size="small" shape="round">{{
              t('datatable.text.approval')
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
        </template>
        <template v-if="record.payment_Type === 1">
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
import { apis } from '@/store/api';

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
const propsSearch = computed(() => props.search);
const invoiceActive = ref(false);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const errCode = computed(() => store.state['common'].errCode);
const userPaymentConfirmMsg = computed(() => store.state['partner'].userPaymentConfirmMsg);
const otpVerify = computed(() => store.state['otp'].otpVerify);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const headerInfo = computed(() => store.state['partner'].headerInfo.recentPaymentList);
const headerModalInfo = computed(() => store.state['partner'].headerModalInfo?.recentPaymentList);
const undefinedCurrentSn = computed(() => store.state['partner'].undefinedCurrentSn);
let invoiceData = ref({});

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
    if (undefinedCurrentSn.value !== undefined && undefinedCurrentSn.value !== null) {
      const response = await apis.PaymentRecentPaymentList({
        user_Sn: undefinedCurrentSn.value,
        payment_Type: 0,
      });
      if (response.data.errCode === 0) return response.data.returnData;
    }

    // if (propsSearch.value !== undefined) {
    //   if (undefinedCurrentSn.value !== null) {
    //     const response = await apis.PaymentRecentPaymentList({
    //       user_Sn: undefinedCurrentSn.value,
    //       payment_Type: 0,
    //     });
    //     const getData = response.data;
    //     if (getData.errCode === 0) return getData.returnData;
    //   }
    // } else {
    //   if (propsSortation.value === undefined) {
    //     const response = await apis.PaymentRecentPaymentList({
    //       user_Sn: 0,
    //       payment_Type: 0,
    //     });
    //     const getData = response.data;
    //     if (getData.errCode === 0) return getData.returnData;
    //     // } else {
    //     //   await store.dispatch('partner/PartnerPaymentRecentPaymentListModal', {
    //     //     user_Sn: 0,
    //     //     payment_Type: propsSortation.value,
    //     //   });
    //     //   if (headerModalInfo.value.errCode === 0) return headerModalInfo.value.returnData;
    //     // }
    //   }
    // }
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
  } else {
    openNotification(partnerWithdrawStateChange.value.errMessage, 'error');
  }
  store.commit('partner/SET_PARTNER_WITHDRAW_STATE_CHANGE', {});
};

watch(userPaymentConfirmMsg, (val) => {
  showConfirm(val);
});

// watch(headerInfo, (val) => {
//   if (propsSortation.value === undefined) {
//     dataSource.value = val.returnData;
//   }
// });

// watch(headerModalInfo, (val) => {
//   if (propsSortation.value !== undefined) {
//     dataSource.value = val.returnData;
//   }
// });

watch(undefinedCurrentSn, (val) => {
  if (val !== null || val !== undefined) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    // store.dispatch('partner/PartnerPaymentRecentPaymentListModal', {
    //   user_Sn: val,
    //   payment_Type: 0,
    // });
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

  if (propsSearch.value !== undefined) {
    columns.value.splice(3, 1);
  }
});
</script>
