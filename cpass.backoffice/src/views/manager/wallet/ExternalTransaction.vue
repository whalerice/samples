<template>
  <FilterContainer
    v-if="!(isTopMenu || isWallet || isPartner)"
    class="mb-15 filter-container"
    :data="filterData"
    @getData="getFilterData"
  />

  <div class="tabs" v-if="!(isTopMenu || isWallet || isPartner)">
    <a-button
      v-for="item in tabs"
      :key="item.key"
      :class="{ active: currentTab.key === item.key }"
      @click="changeTabEvent(item)"
    >
      <span class="name">{{ $t(item.title) }}</span>
      <a-badge :count="item.count" />
    </a-button>
  </div>

  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
  >
    <template #title v-if="!(isTopMenu || isWallet || isPartner)">
      <h4 class="title">
        <span class="text">{{ $t(currentTab.title) }}</span>
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
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span
          v-if="
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'actual' &&
            column.dataIndex !== 'approvalRefusal' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'confirm_Memo' &&
            column.dataIndex !== 'transfer_Memo'
          "
          >{{ text }}</span
        >
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr" v-if="record.addr !== ''" copyable>
          {{ record.addr }}
        </a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }} </template>
      <template v-if="column.dataIndex === 'actual'">{{ comma(record.actual) }} </template>
      <template v-if="column.dataIndex === 'state'">
        {{ getDefaultWalletState(t, record.state).label() }}
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        {{ matchingCoinLabel(text) }}
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
          :style="{ width: '10ch' }"
          :ellipsis="true"
          :content="text"
          @click="openTransferMemo(record)"
        />
      </template>
      <template v-if="column.dataIndex === 'approvalRefusal' && record.isApproval">
        <div class="btn-group">
          <a-button
            v-if="tabIndex === Enum.defaultWalletState.secondApprovalWait"
            shape="round"
            size="small"
            @click="reconsiderRequest(record)"
          >
            {{ $t('common.button.reconsider') }}
          </a-button>
          <a-button
            v-if="record.state !== Enum.defaultWalletState.firstApprovalRefuse"
            type="primary"
            shape="round"
            class="approval"
            size="small"
            @click="approveRequest(record)"
          >
            {{ $t('common.button.approval') }}
          </a-button>
          <a-button
            v-if="record.state !== Enum.defaultWalletState.secondApprovalWait"
            danger
            shape="round"
            class="refusal"
            size="small"
            @click="openStateChange('refusal', record)"
          >
            {{ $t('common.button.refusal') }}
          </a-button>
        </div>
      </template>
    </template>
  </a-table>

  <StateChangeModal
    :visible="stateChangeVisible"
    :data="stateChangeData"
    :type="stateChangeType"
    @close="closeStateChange"
    @return="returnStateChange"
  />

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
</template>

<script setup>
import FilterContainer from '@/components/filter/FilterContainer.vue';
import StateChangeModal from '@/components/modals/StateChangeModal.vue';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';
import { Enum } from '@/assets/js/enum.js';
import { usePagination } from 'vue-request';
import { notification } from 'ant-design-vue';
import { ref, computed, onBeforeMount, watch } from 'vue';
import { GetManagerWithdrawList, WithdrawStateChange } from '@/store/api';
import { comma, auth, admin, manager, getDefaultWalletState, deepCopy, matchingCoinLabel } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isPartner = computed(() => props.type === 'partner');
const isTopMenu = computed(() => props.type === 'topMenu');
const isWallet = computed(() => props.type === 'wallet');
const coinList = computed(() => store.state['sign'].coinList);
const grade = computed(() => store.state['sign'].signInfo.grade);
const walletsInfo = computed(() => store.state['trade'].walletsInfo);
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isRefresh = computed(() => store.state['manager'].managerTopMenu.exTransacion);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const isMobile = ref(isDeviceMobile.value);
const tabs = ref([
  {
    key: Enum.defaultWalletState.firstApprovalWait,
    title: 'kyc.tab_title.waiting_1',
    count: 0,
  },
  {
    key: Enum.defaultWalletState.secondApprovalWait,
    title: 'kyc.tab_title.waiting_2',
    count: 0,
  },
  {
    key: Enum.defaultWalletState.transactionWait,
    title: 'datatable.title.approval_list',
    count: 0,
  },
  {
    key: Enum.defaultWalletState.firstApprovalRefuse,
    title: 'datatable.title.refusal_list',
    count: 0,
  },
]);
const currentTab = ref(tabs.value[0]);
const tabIndex = ref(-1);

const gradeDecision = () => {
  const waiting1stPossible =
    grade.value !== auth.Supervisor && (admin.includes(grade.value) || manager.includes(grade.value));
  const waiting2ndPossible = admin.includes(grade.value);

  if (waiting1stPossible && !waiting2ndPossible) {
    return true;
  } else if (!waiting1stPossible && waiting2ndPossible) {
    return false;
  } else if (waiting1stPossible && waiting2ndPossible) {
    return 'all';
  }
};
const changeTabEvent = (item) => {
  selectedPageSize.value = pageSizeOptions.value[0];
  currentTab.value = item;
  tabIndex.value = item.key;
  createColumns(item);
  handleTableChange({ page: 1, results: 10 }, {}, {});
};
const totalCount = ref(0);
const columns = ref([
  {
    title: 'common.label.request_date',
    dataIndex: 'requestDate',
  },
  {
    title: 'datatable.thead.processed_date',
    dataIndex: 'processDate',
    topMenu: true,
    wallet: true,
  },
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
    wallet: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    align: 'right',
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'fee',
    align: 'right',
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
  },
  {
    title: 'datatable.thead.approver_id',
    dataIndex: 'manager_Id',
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
    className: 'btn-cell',
  },
]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value || isWallet.value || isPartner.value ? 'small' : '',
}));
const openNotification = (val, state) => {
  notification[`${state}`]({
    message: `${val}`,
  });
};
const dataControl = ref({
  requestStartDate: '',
  requestEndDate: '',
  processStartDate: '',
  processEndDate: '',
  coinCd: Object.values(coinList.value).map((e) => e.value),
  search: '',
});

const queryData = async (params) => {
  try {
    const gradeResult = gradeDecision();
    if (isTopMenu.value || isPartner.value || isWallet.value) {
      if (gradeResult) {
        tabIndex.value = Enum.defaultWalletState.firstApprovalWait;
      } else if (!gradeResult) {
        tabIndex.value = Enum.defaultWalletState.secondApprovalWait;
      }
    }

    const response = await GetManagerWithdrawList({
      user_Sn: isWallet.value || isPartner.value ? props.sn : 0,
      viewTab: tabIndex.value,
      currentPage: params.page,
      currentPageSize: params.results,
      requestStartDate: dataControl.value.requestStartDate,
      requestEndDate: dataControl.value.requestEndDate,
      processStartDate: dataControl.value.processStartDate,
      processEndDate: dataControl.value.processEndDate,
      coin_Cd: dataControl.value.coinCd,
      search: dataControl.value.search,
    });

    if (response.data.errCode === 0) {
      const getData = response.data.returnData;
      if (getData.waiting_Count !== null) {
        tabs.value[0].count = getData.firstWaitingCount.count;
        tabs.value[1].count = getData.secondWaitingCount.count;
        tabs.value[2].count = getData.approvalCount.count;
        tabs.value[3].count = getData.refusalCount.count;
      }

      if (tabIndex.value === tabs.value[0].key && getData.firstWaitingCount) {
        totalCount.value = getData.firstWaitingCount.count;
      }

      if (tabIndex.value === tabs.value[1].key && getData.secondWaitingCount) {
        totalCount.value = getData.secondWaitingCount.count;
      }

      if (tabIndex.value === tabs.value[2].key && getData.approvalCount) {
        totalCount.value = getData.approvalCount.count;
      }
      if (tabIndex.value === tabs.value[3].key && getData.refusalCount) {
        totalCount.value = getData.refusalCount.count;
      }
      return getData.list;
    }
  } catch (error) {
    console.error(error);
  }
};

const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
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
const addApRfCol = (type) => {
  const results = columns.value.findIndex((e) => e.dataIndex === 'approvalRefusal');

  if (type) {
    if (results === -1) {
      columns.value.push({
        title: 'datatable.thead.approval_refusal',
        dataIndex: 'approvalRefusal',
        className: 'btn-cell',
      });
    }
  } else {
    if (results !== -1) {
      columns.value.splice(results, 1);
    }
  }
};
const addMemoCol = (type) => {
  const results = columns.value.findIndex((e) => e.dataIndex === 'confirm_Memo');
  if (type) {
    if (results === -1) {
      columns.value.push({
        title: 'datatable.thead.memo_confirmation',
        dataIndex: 'confirm_Memo',
      });
      columns.value.push({
        title: 'datatable.thead.memo_send',
        dataIndex: 'transfer_Memo',
      });
    }
  } else {
    if (results !== -1) {
      columns.value.splice(results, 2);
    }
  }
};
const createColumns = (item) => {
  const gradeResult = gradeDecision();
  if (item.key === Enum.defaultWalletState.firstApprovalWait) {
    if (gradeResult || gradeResult === 'all') {
      addApRfCol(true);
    } else {
      addApRfCol(false);
    }
    addMemoCol(false);
  } else if (item.key === Enum.defaultWalletState.secondApprovalWait) {
    if (!gradeResult || gradeResult === 'all') {
      addApRfCol(true);
    } else {
      addApRfCol(false);
    }
    addMemoCol(false);
  } else {
    if (item.key === Enum.defaultWalletState.firstApprovalRefuse) {
      addMemoCol(true);
    } else {
      addMemoCol(false);
    }
    addApRfCol(false);
  }
};

const stateChangeVisible = ref(false);
const stateChangeData = {
  refusalLabel: 'confirm.description.cpeso_refusal',
};
const stateChangeType = ref('');
const stateChangeSendData = ref(null);

const openStateChange = async (type, record) => {
  if (type === 'refusal' && record.state !== Enum.defaultWalletState.firstApprovalRefuse) {
    const getData = await refuseRequest(record);

    if (getData.errCode === 0) {
      openNotification(t('notification.title.success'), 'success');
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(getData.errMessage, 'error');
    }
    topMenuRefresh();
  } else {
    stateChangeSendData.value = record;
    stateChangeType.value = type;
    stateChangeVisible.value = true;
  }
};
const closeStateChange = () => {
  stateChangeSendData.value = null;
  stateChangeType.value = '';
  stateChangeVisible.value = false;
};
const returnStateChange = async (val) => {
  let getData = null;
  if (val.type === 'refusal') {
    getData = await refuseRequest(stateChangeSendData.value, val);
  }

  if (getData.errCode === 0) {
    openNotification(t('notification.title.success'), 'success');
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  } else {
    openNotification(getData.errMessage, 'error');
  }
  topMenuRefresh();
  closeStateChange();
};

const approveRequest = async (data) => {
  const response = await WithdrawStateChange({
    dealId: data.deal_Id,
    stateChange: 1,
  });
  const getData = response.data;

  if (getData.errCode === 0) {
    openNotification(t('confirm.title.success'), 'success');
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  } else {
    openNotification(getData.errMessage, 'error');
  }
  topMenuRefresh();
};
const refuseRequest = async (data, val) => {
  const response = await WithdrawStateChange({
    dealId: data.deal_Id,
    stateChange: 0,
    transferMemo: val === undefined ? '' : val.content,
    signature: val === undefined ? '' : val.signature,
  });
  const getData = response.data;

  return getData;
};
const reconsiderRequest = async (data) => {
  const response = await WithdrawStateChange({
    dealId: data.deal_Id,
    stateChange: -1,
  });
  const getData = response.data;

  if (getData.errCode === 0) {
    openNotification(t('confirm.title.success'), 'success');
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  } else {
    openNotification(getData.errMessage, 'error');
  }
  topMenuRefresh();
};
const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const memoModalInfo = ref({});
const transferMemoInfo = ref({});
const memoModalVisible = ref(false);
const transferMemoVisible = ref(false);

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
    const response = await apis.manager.WithdrawConfirmMemo({
      dealId: memoModalInfo.value.deal_Id,
      confirmMemo: memoModalInfo.value.confirm_Memo,
    });
    const getData = response.data;
    if (getData.errCode === 0) {
      openNotification(t('notification.title.success'), 'success');
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
    } else {
      openNotification(getData.errMessage, 'error');
    }
    closeMemo();
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
const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);
const filterData = [
  {
    type: 'rangePicker',
    name: 'requestDate',
    placeHolder: () => t('common.label.request_date'),
    order: 1,
  },
  {
    type: 'rangePicker',
    name: 'processDate',
    placeHolder: () => t('datatable.thead.processed_date'),
    order: 2,
  },
  {
    type: 'select',
    name: 'coin',
    data: coinOption.value,
    order: 4,
    placeHolder: () => t('datatable.thead.coin'),
  },
  {
    type: 'totalSearch',
    name: 'search',
    order: 5,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.external_transaction');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];
const getFilterData = (val) => {
  const temp = deepCopy(val);
  const defaultCoin = Object.values(coinList.value).map((e) => e.value);

  dataControl.value = {
    requestStartDate: temp.requestDate[0],
    requestEndDate: temp.requestDate[1],
    processStartDate: temp.processDate[0],
    processEndDate: temp.processDate[1],
    coinCd: temp.coin.length > 0 ? temp.coin : defaultCoin,
    search: temp.search,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(walletsInfo.value, () => {
  if (isTopMenu.value || isWallet.value || isPartner.value) {
    const gradeResult = gradeDecision();
    createColumns(gradeResult ? tabs.value[0] : tabs.value[1]);
  } else {
    createColumns(currentTab.value);
  }
});
watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
onBeforeMount(async () => {
  await store.dispatch('trade/checkHardWallet');

  if (isTopMenu.value || isWallet.value || isPartner.value) {
    const gradeResult = gradeDecision();
    createColumns(gradeResult ? tabs.value[0] : tabs.value[1]);
  } else {
    createColumns(currentTab.value);
  }

  if (isWallet.value || isPartner.value) {
    columns.value = columns.value.filter((e) => !e.wallet);
  } else if (isTopMenu.value) {
    columns.value = columns.value.filter((e) => !e.topMenu);
  }
});
</script>
