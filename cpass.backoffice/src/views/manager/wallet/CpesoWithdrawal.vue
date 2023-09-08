<template>
  <FilterContainer
    v-if="!(isTopMenu || isWallet)"
    class="mb-10 filter-container"
    :data="filterData"
    @getData="getFilterData"
  />
  <a-table
    class="cpeso-deposit"
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
    <template #headerCell="{ title }"> {{ t(title) }}</template>
    <template #title v-if="!(isTopMenu || isWallet)">
      <h4 class="title">
        <span class="text">{{ $t('nav.cpeso_withdraw') }}</span>
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
    <template #bodyCell="{ column, text, record }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'withdrawal_Number' &&
            column.dataIndex !== 'confirm_Memo'
          "
          >{{ text }}</span
        >
      </template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-text
          v-if="text === Enum.cpesoStateType.FirstRequest || text === Enum.cpesoStateType.SecondRequest"
        >
          {{ $t('datatable.text.ongoing') }}
          <template v-if="!isViewer">
            <a-button class="ml-5 mr-5" size="small" shape="round" @click="openStateChange('refusal', record)" danger>
              {{ t('common.button.refusal') }}
            </a-button>
            <a-button
              type="primary"
              size="small"
              shape="round"
              :disabled="record.withdrawal_Number === null || record.withdrawal_Number === ''"
              @click="openStateChange('approval', record)"
            >
              {{ t('common.button.approval') }}
            </a-button>
          </template>
        </a-typography-text>
        <a-typography-text v-if="text === Enum.cpesoStateType.Approval" type="success">{{
          $t('datatable.text.approval')
        }}</a-typography-text>
        <a-typography-text
          v-if="text === Enum.cpesoStateType.FirstRefusal || text === Enum.cpesoStateType.SecondRefusal"
          type="danger"
        >
          {{ $t('common.button.refusal') }}</a-typography-text
        >
      </template>
      <template v-if="column.dataIndex === 'withdrawal_Number'">
        <a-input
          v-model:value="record.withdrawal_Number"
          style="width: 20rem"
          size="small"
          type="text"
          :disabled="
            record.state !== Enum.cpesoStateType.FirstRequest && record.state !== Enum.cpesoStateType.SecondRequest
          "
        />
      </template>
      <template v-if="column.dataIndex === 'confirm_Memo'">
        <a-typography-link
          v-if="text !== null"
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="text"
          @click="openMemo(record)"
        />
        <a-typography-link
          v-else
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="$t('common.label.note_taking')"
          @click="openMemo(record)"
        />
      </template>
      <template v-if="column.dataIndex === 'transfer_Memo'">
        <a-typography-link
          v-if="text !== null"
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="text"
          @click="openTransferMemo(record)"
        />
      </template>
    </template>
  </a-table>
  <a-modal
    v-model:visible="memoModalVisible"
    :title="$t('drawer.label.memo')"
    :okText="$t('common.button.change')"
    :cancelText="$t('common.button.cancel')"
    @ok="modifyMemo"
    @cancel="closeMemo"
  >
    <a-textarea
      v-model:value="memoModalInfo.confirm_Memo"
      :placeholder="$t('datatable.thead.memo_confirmation')"
      :rows="4"
    />
  </a-modal>
  <a-modal
    v-model:visible="transferMemoVisible"
    :title="$t('datatable.thead.memo_send')"
    :footer="null"
    @cancel="closeTransferMemo"
  >
    <a-textarea
      v-model:value="transferMemoInfo.transfer_Memo"
      :placeholder="$t('datatable.thead.memo_confirmation')"
      :rows="4"
      :readOnly="true"
    />
  </a-modal>
  <StateChangeModal
    :visible="stateChangeVisible"
    :data="stateChangeData"
    :type="stateChangeType"
    @close="closeStateChange"
    @return="returnStateChange"
  />
</template>
<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';
import StateChangeModal from '@/components/modals/StateChangeModal.vue';

import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy, lottieModal } from '@/assets/js/global.js';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { notification, Modal } from 'ant-design-vue';
import { Enum } from '@/assets/js/enum.js';
import { auth } from '@/assets/js/global';

//common
const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isRefresh = computed(() => store.state['manager'].managerTopMenu.cpesoSell);
const isWallet = computed(() => props.type === 'wallet');
const isTopMenu = computed(() => props.type === 'topMenu');
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const signInfo = computed(() => store.state['sign'].signInfo);
const isMobile = ref(isDeviceMobile.value);
const memoModalVisible = ref(false);
const memoModalInfo = ref({});
const transferMemoVisible = ref(false);
const transferMemoInfo = ref({});

const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};

//filter
const isViewer = ref(false);

const selectOption = ref([
  {
    value: String(Enum.cpesoStateType.FirstRequest) + ',' + String(Enum.cpesoStateType.SecondRequest),
    label: () => {
      return t('datatable.text.ongoing');
    },
    checked: false,
  },
  {
    value: Enum.cpesoStateType.Approval,
    label: () => {
      return t('datatable.text.approval');
    },
    checked: false,
  },
  {
    value: String(Enum.cpesoStateType.FirstRefusal) + ',' + String(Enum.cpesoStateType.SecondRefusal),
    label: () => {
      return t('common.button.refusal');
    },
    checked: false,
  },
]);
const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('common.label.request_date'),
    order: 1,
  },
  {
    type: 'select',
    name: 'state',
    data: selectOption.value,
    order: 2,
    placeHolder: () => {
      return t('datatable.thead.state');
    },
  },
  {
    type: 'totalSearch',
    name: 'advanceSearch',
    order: 3,
    search: '',
    placeHolder: () => {
      return t('search.label.cpeso_withdraw_search');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];
//table
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const dataControl = ref({
  requestStartDate: '',
  requestEndDate: '',
  state: '-1,0,2,4,5',
  search: '',
});
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'payment_Time',
    key: 'payment_Time',
    sorter: true,
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    key: 'cpass_Id',
    sorter: true,
    wallet: true,
  },
  {
    title: 'datatable.thead.name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: 'datatable.thead.phone_number',
    dataIndex: 'phone_Number',
    key: 'phone_Number',
    sorter: true,
  },
  {
    title: 'datatable.thead.bank',
    dataIndex: 'payment_Method',
    key: 'payment_Method',
    sorter: true,
  },
  {
    title: 'datatable.thead.account_number',
    dataIndex: 'account_Number',
    key: 'account_Number',
    sorter: true,
  },
  {
    title: 'datatable.thead.account_name',
    dataIndex: 'account_Name',
    key: 'account_Name',
    sorter: true,
  },
  {
    title: 'datatable.thead.request_amount',
    dataIndex: 'payment_Amount',
    key: 'payment_Amount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.next_pay_fee',
    dataIndex: 'provider_Fee',
    key: 'provider_Fee',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.cpass_fee',
    dataIndex: 'cpass_Fee',
    key: 'cpass_Fee',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.final_amount',
    dataIndex: 'actual',
    key: 'actual',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.withdrawal_number',
    dataIndex: 'withdrawal_Number',
    key: 'withdrawal_Number',
    sorter: true,
    className: 'btn-cell',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    sorter: true,
    className: 'btn-cell',
  },
  {
    title: 'datatable.thead.memo_confirmation',
    dataIndex: 'confirm_Memo',
    key: 'confirm_Memo',
    sorter: true,
    hidden: true,
  },
  {
    title: 'datatable.thead.memo_send',
    dataIndex: 'transfer_Memo',
    key: 'transfer_Memo',
    sorter: true,
    hidden: true,
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
    userSn: isWallet.value ? props.sn : 0,
    currentPage: params.page,
    currentPageSize: params.results,
    order: order,
    sort: sort,
    state: dataControl.value.state,
    search: dataControl.value.search,
    requestStartDate: dataControl.value.requestStartDate,
    requestEndDate: dataControl.value.requestEndDate,
  };

  if (isTopMenu.value || isWallet.value) {
    data.state = String(Enum.cpesoStateType.FirstRequest) + ',' + String(Enum.cpesoStateType.SecondRequest);
  }

  try {
    const response = await apis.GetNextPayWithdrawList(data);
    if (response?.data.errCode === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count.count;
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
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value || isWallet.value ? 'small' : '',
}));
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
const getFilterData = (val) => {
  const temp = deepCopy(val);

  const defaultState = Object.values(Enum.cpesoStateType).join(',');

  dataControl.value = {
    requestStartDate: temp.requestDate[0],
    requestEndDate: temp.requestDate[1],
    state: temp.state.length === 0 ? defaultState : temp.state.join(','),
    search: temp.advanceSearch,
  };
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
const approval = async (val) => {
  const response = await apis.SetNextPaymentApproval({
    paymentIdx: stateChangeSendData.value.idx,
    dealId: stateChangeSendData.value.deal_Id,
    approveYN: true,
    refusalMemo: '',
    withdrawalNumber: stateChangeSendData.value.withdrawal_Number,
    signature: val.signature,
  });
  const getData = response.data;

  return getData;
};
const refusal = async (val) => {
  const response = await apis.SetNextPaymentApproval({
    paymentIdx: stateChangeSendData.value.idx,
    dealId: stateChangeSendData.value.deal_Id,
    approveYN: false,
    refusalMemo: val.content,
    signature: val.signature,
  });
  const getData = response.data;

  return getData;
};
//memo
const openMemo = (record) => {
  memoModalInfo.value = deepCopy(record);
  memoModalVisible.value = true;
};
const closeMemo = () => {
  memoModalVisible.value = false;
  setTimeout(() => {
    memoModalInfo.value = {};
  }, 300);
};
const modifyMemo = async () => {
  try {
    const response = await apis.CpesoSellConfirmMemo({
      idx: memoModalInfo.value.idx,
      value: memoModalInfo.value.confirm_Memo,
    });
    const getData = response.data;

    if (getData.errCode === 0) {
      closeMemo();
      await lottieModal(t('component.title.success_confirm'), 'setting', 1.5);
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(getData.errMessage, 'error');
    }
  } catch (error) {
    console.error(error);
  }
};
const openTransferMemo = (record) => {
  transferMemoInfo.value = deepCopy(record);
  transferMemoVisible.value = true;
};
const closeTransferMemo = () => {
  transferMemoVisible.value = false;
  setTimeout(() => {
    transferMemoInfo.value = {};
  }, 300);
};

const stateChangeVisible = ref(false);
const stateChangeData = {
  refusalOptions: [
    {
      value: 1,
      label: 'datatable.text.not_match_account',
    },
  ],
  refusalLabel: 'confirm.description.cpeso_accept',
  confirmLabel: 'confirm.description.cpeso_accept',
};
const stateChangeType = ref('');
const stateChangeSendData = ref(null);
const openStateChange = (type, record) => {
  stateChangeSendData.value = record;
  stateChangeType.value = type;
  stateChangeVisible.value = true;
};
const closeStateChange = () => {
  stateChangeSendData.value = null;
  stateChangeType.value = '';
  stateChangeVisible.value = false;
};

const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};

const returnStateChange = async (val) => {
  let getData = null;

  if (val.type === 'approval') {
    getData = await approval(val);
  } else if (val.type === 'refusal') {
    getData = await refusal(val);
  }

  if (getData.errCode === 0) {
    await lottieModal(t('confirm.description.success_saved'), 'setting', 2);
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  } else {
    openNotification(getData.errMessage, 'error');
  }
  closeStateChange();
  topMenuRefresh();
};
watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
onBeforeMount(() => {
  isViewer.value = signInfo.value.grade === auth.Viewer;

  if (isTopMenu.value) {
    columns.value = columns.value.filter((e) => !e.hidden);
  } else if (isWallet.value) {
    columns.value = columns.value.filter((e) => !(e.wallet || e.hidden));
  }
});
</script>
