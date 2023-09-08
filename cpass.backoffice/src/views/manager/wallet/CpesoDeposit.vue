<template>
  <a-button v-if="!(isTopMenu || isWallet)" class="upload-button mb-10" type="primary" @click="openUpload">{{
    $t('common.label.file_upload')
  }}</a-button>
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
        <span class="text">{{ $t('nav.cpeso_deposit') }}</span>
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
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'currency_Type' &&
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
          <a-button class="ml-5 mr-5" size="small" shape="round" @click="openStateChange('refusal', record)" danger>
            {{ t('common.button.refusal') }}
          </a-button>
          <a-button type="primary" size="small" shape="round" @click="openStateChange('approval', record)">
            {{ t('common.button.approval') }}
          </a-button>
        </a-typography-text>
        <a-typography-text v-if="text === Enum.cpesoStateType.Approval" type="success">
          {{ $t('datatable.text.approval') }}
        </a-typography-text>
        <a-typography-text
          v-if="text === Enum.cpesoStateType.FirstRefusal || text === Enum.cpesoStateType.SecondRefusal"
          type="danger"
        >
          {{ $t('common.button.refusal') }}
        </a-typography-text>
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
    :title="$t('datatable.thead.memo_confirmation')"
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
  <FileUpload :visible="uploadVisible" @returnUpload="returnUpload" />
  <CpesoVerification
    :visible="verificationVisible"
    :data="verificationData"
    @close="closeVerification"
    @returnVerification="returnVerification"
  />
  <StateChangeModal
    :visible="stateChangeVisible"
    :data="stateChangeData"
    :type="stateChangeType"
    @close="closeStateChange"
    @return="returnStateChange"
  />
</template>
<script setup>
import FileUpload from '@/components/common/FileUpload.vue';
import FilterContainer from '@/components/filter/FilterContainer.vue';
import StateChangeModal from '@/components/modals/StateChangeModal.vue';
import CpesoVerification from '@/components/datatable/CpesoVerification.vue';

import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { Enum } from '@/assets/js/enum.js';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { usePagination } from 'vue-request';
import { notification } from 'ant-design-vue';
import { comma, deepCopy, lottieModal } from '@/assets/js/global.js';

//common
const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isTopMenu = computed(() => props.type === 'topMenu');
const isWallet = computed(() => props.type === 'wallet');
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const memoModalVisible = ref(false);
const memoModalInfo = ref({});
const transferMemoVisible = ref(false);
const transferMemoInfo = ref({});
const uploadVisible = ref(false);
const verificationData = ref();
const verificationVisible = ref(false);
const isRefresh = computed(() => store.state['manager'].managerTopMenu.cpesoBuy);

const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};

//filter
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
    name: 'addTime',
    placeHolder: () => t('common.label.created_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('common.label.request_date'),
    order: 2,
  },
  {
    type: 'rangePicker',
    name: 'processDate',
    placeHolder: () => t('datatable.thead.processed_date'),
    order: 3,
  },
  {
    type: 'select',
    name: 'state',
    data: selectOption.value,
    order: 4,
    placeHolder: () => t('datatable.thead.state'),
  },
  {
    type: 'totalSearch',
    name: 'advanceSearch',
    order: 5,
    search: '',
    placeHolder: () => {
      return t('search.label.cpeso_deposit_search');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

//table
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const dataControl = ref({
  addTimeStart: '',
  addTimeEnd: '',
  requestStartDate: '',
  requestEndDate: '',
  processStartDate: '',
  processEndDate: '',
  state: '-1,0,2,4,5',
  search: '',
});
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const columns = ref([
  {
    title: 'common.label.created_date',
    dataIndex: 'addtime',
    key: 'addtime',
    sorter: true,
    align: 'left',
  },
  {
    title: 'common.label.request_date',
    dataIndex: 'payment_Time',
    key: 'payment_Time',
    sorter: true,
    align: 'left',
    hidden: true,
  },
  {
    title: 'datatable.thead.processed_date',
    dataIndex: 'processing_Time',
    key: 'processing_Time',
    sorter: true,
    align: 'left',
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    key: 'cpass_Id',
    sorter: true,
    align: 'left',
    wallet: true,
  },
  {
    title: 'datatable.thead.name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    align: 'left',
  },
  {
    title: 'datatable.text.payment',
    dataIndex: 'payment_Method',
    key: 'payment_Method',
    sorter: true,
    align: 'left',
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
    title: 'datatable.thead.deliver_cpeso',
    dataIndex: 'actual_Transfer',
    key: 'actual_Transfer',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    sorter: true,
    align: 'left',
  },
  {
    title: 'datatable.thead.memo_confirmation',
    dataIndex: 'confirm_Memo',
    key: 'confirm_Memo',
    sorter: true,
    align: 'left',
    hidden: true,
  },
  {
    title: 'datatable.thead.memo_send',
    dataIndex: 'transfer_Memo',
    key: 'transfer_Memo',
    sorter: true,
    align: 'left',
    hidden: true,
  },
  {
    title: 'datatable.thead.email',
    dataIndex: 'email_Address',
    key: 'email_Address',
    sorter: true,
    align: 'left',
    hidden: true,
  },
  {
    title: 'datatable.thead.payment_id',
    dataIndex: 'payment_Id',
    key: 'payment_Id',
    sorter: true,
    align: 'left',
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
    addTimeStart: dataControl.value.addTimeStart,
    addTimeEnd: dataControl.value.addTimeEnd,
    requestStartDate: dataControl.value.requestStartDate,
    requestEndDate: dataControl.value.requestEndDate,
    processStartDate: dataControl.value.processStartDate,
    processEndDate: dataControl.value.processEndDate,
  };

  if (isTopMenu.value || isWallet.value) {
    data.state = String(Enum.cpesoStateType.FirstRequest) + ',' + String(Enum.cpesoStateType.SecondRequest);
  }

  try {
    const response = await apis.GetNextPayDepositList(data);

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
const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const getFilterData = (val) => {
  const temp = deepCopy(val);

  const defaultState = Object.values(Enum.cpesoStateType).join(',');

  dataControl.value = {
    addTimeStart: temp.addTime[0],
    addTimeEnd: temp.addTime[1],
    requestStartDate: temp.requestDate[0],
    requestEndDate: temp.requestDate[1],
    processStartDate: temp.processDate[0],
    processEndDate: temp.processDate[1],
    state: temp.state.length === 0 ? defaultState : temp.state.join(','),
    search: temp.advanceSearch,
  };
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
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
  topMenuRefresh();
  closeStateChange();
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
    const response = await apis.CpesoBuyConfirmMemo({
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
//
const approval = async (val) => {
  const response = await apis.SetNextPaymentApproval({
    paymentIdx: stateChangeSendData.value.idx,
    dealId: stateChangeSendData.value.deal_Id,
    approveYN: true,
    refusalMemo: '',
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
//fileUpload
const openUpload = () => {
  uploadVisible.value = true;
};
const returnUpload = (val) => {
  if (!val) {
    uploadVisible.value = val;
  } else {
    uploadVisible.value = false;
    verificationData.value = val.returnData;
    setTimeout(() => {
      verificationVisible.value = true;
    }, 300);
  }
};
//verification
const closeVerification = () => {
  verificationVisible.value = false;
  verificationData.value == null;
};
const returnVerification = async () => {
  await lottieModal(t('confirm.description.success_saved'), 'setting', 2);
  topMenuRefresh();
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});

onBeforeMount(() => {
  if (isTopMenu.value) {
    columns.value = columns.value.filter((e) => !e.hidden);
  } else if (isWallet.value) {
    columns.value = columns.value.filter((e) => !(e.wallet || e.hidden));
  }
});
</script>
