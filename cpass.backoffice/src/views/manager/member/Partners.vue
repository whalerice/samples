<template>
  <Indicators :data="indicatorList" v-if="!isTopMenu" />
  <FilterContainer v-if="!isTopMenu" class="mb-10 filter-container" :data="filterData" @getData="getFilterData" />
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    :rowKey="(index) => index"
    :rowExpandable="(record) => record?.wallet.length !== 1"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #title v-if="!isTopMenu">
      <h4 class="title">{{ $t('datatable.title.partner_list') }}</h4>
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
    <template #bodyCell="{ column, record, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <template
          v-if="
            column.dataIndex !== 'id' &&
            column.dataIndex !== 'rate' &&
            column.dataIndex !== 'guarantee' &&
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'grade' &&
            column.dataIndex !== 'currency_Type'
          "
        >
          <span>{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'state'">
          <a-button danger size="small" shape="round" @click="showRefusalModal(record.user_Sn)">
            {{ $t('common.button.refusal') }}
          </a-button>
          <a-button type="primary" size="small" shape="round" @click="openDetail(record)">{{
            $t('common.button.approval')
          }}</a-button>
        </template>
      </template>
      <template v-if="column.dataIndex === 'id'">
        <MemberBtn :data="record" :type="'partner'" :open="visibleDetail" @update="refresh" />
        <a-badge :status="userStateType.filter((e) => e.value === record.state)[0].color" class="ml-5" />
      </template>

      <template v-if="column.dataIndex === 'rate'">
        {{ record.partner_Rate * 100 }}% / {{ record.withdraw_Rate * 100 }}%
      </template>
      <template v-if="column.dataIndex === 'guarantee'">
        {{ comma(record.guarantee) }}
      </template>
      <template v-if="column.dataIndex === 'state' && !isMobile">
        <a-typography-text
          :type="userStateType.filter((e) => e.value === record.state)[0].color"
          v-if="record.state !== Enum.userStateType.Request"
        >
          {{ userStateType.filter((e) => e.value === record.state)[0].label() }}
        </a-typography-text>
        <div class="btn-group" v-if="record.state === Enum.userStateType.Request">
          <a-button danger size="small" shape="round" @click="showRefusalModal(record.user_Sn)">
            {{ $t('common.button.refusal') }}
          </a-button>
          <a-button type="primary" size="small" shape="round" @click="openDetail(record)">
            {{ $t('common.button.approval') }}
          </a-button>
        </div>
        <div class="btn-group" v-if="record.state === Enum.userStateType.ConfirmDeposit">
          <a-button shape="round" size="small" @click="sendConfirmationEmail(record.user_Sn)">
            <fa-icon icon="envelope"></fa-icon>
            {{ $t('common.button.send_email') }}
          </a-button>
        </div>
      </template>
      <template v-if="column.dataIndex === 'grade'">
        {{ accessName(record.grade) }}
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        <template v-if="record.currency_Type !== 0">
          {{ matchingCurrencySymbol(record?.currency_Type) }}
        </template>
        <template v-if="record.currency_Type === 0">
          {{ null }}
        </template>
      </template>
    </template>
    <template #expandedRowRender="{ record }">
      <a-table
        :columns="innerColumns"
        :data-source="record.wallet"
        size="small"
        :pagination="false"
        class="inner-table"
      >
        <template #headerCell="{ title }"> {{ $t(title) }}</template>
        <template #bodyCell="{ column, record, text }">
          <template v-if="isMobile">
            <template v-if="column.dataIndex === 'tag'">
              <template v-if="text !== ''"> {{ $t(column.title) }} : </template>
            </template>
            <template v-else> {{ $t(column.title) }} : </template>
            <template
              v-if="
                column.dataIndex !== 'coin_Cd' &&
                column.dataIndex !== 'addr' &&
                column.dataIndex !== 'balance' &&
                column.dataIndex !== 'tag'
              "
            >
              <span> {{ text }}</span>
            </template>
          </template>

          <template v-if="column.dataIndex === 'coin_Cd'">
            <i :class="`coin coin-${record?.coin_Cd}`" />
            <span>{{ matchingCoinLabel(record.coin_Cd) }}</span>
          </template>
          <template v-if="column.dataIndex === 'addr'">
            <a-typography-paragraph class="addr" copyable>
              {{ record.addr }}
            </a-typography-paragraph>
          </template>
          <template v-if="column.dataIndex === 'tag'">
            <a-typography-paragraph class="tag" copyable v-if="record.tag">
              {{ record.tag }}
            </a-typography-paragraph>
          </template>
          <template v-if="column.dataIndex === 'balance'">
            {{ comma(record.balance) }}
          </template>
        </template>
      </a-table>
    </template>
  </a-table>
  <DeletePartnerModal :show="visibleModal" :data="sendUserInfo" @close="closeRefusalModal" />
</template>
<script setup>
import DeletePartnerModal from '@/components/modals/DeletePartnerModal.vue';
import FilterContainer from '@/components/filter/FilterContainer.vue';
import MemberBtn from '@/components/MemberBtn.vue';
import Indicators from '@/components/common/Indicators.vue';

import { Modal, notification } from 'ant-design-vue';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import {
  comma,
  deepCopy,
  accessList,
  matchingCoinLabel,
  matchingCurrencySymbol,
  getUserStateType,
  getPartnerType,
} from '@/assets/js/global.js';
import { Enum } from '@/assets/js/enum.js';
import { PartnerList } from '@/store/api';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: {
    type: String,
  },
});

const isTopMenu = computed(() => props.type === 'topMenu');
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const errorMsg = computed(() => store.state['partner'].refusalError);
const successMsg = computed(() => store.state['partner'].refusalSuccess);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isRefresh = computed(() => store.state['manager'].managerTopMenu.partner);
const isMobile = ref(isDeviceMobile.value);
const approvalGuaranteeMsg = computed(() => store.state['partner'].approvalGuaranteeMsg);
const currencyList = computed(() => store.state['sign'].currencyList);
const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pageCurrent = ref(1);
const typeOptions = ref(getPartnerType(t));
const currencyOptions = computed(() =>
  currencyList.value.map((e) => {
    return { ...e, checked: false };
  }),
);
const stateOptions = ref(getUserStateType(t));
const defaultType = typeOptions.value.map((e) => e.value);
const defaultCurrency = currencyOptions.value.map((e) => e.value);
const defaultState = stateOptions.value.map((e) => e.value);
const userStateType = getUserStateType(t);

const filterData = [
  {
    type: 'select',
    name: 'type',
    data: typeOptions.value,
    order: 1,
    placeHolder: () => {
      return t('datatable.thead.type');
    },
  },
  {
    type: 'select',
    name: 'currency',
    data: currencyOptions.value,
    order: 2,
    placeHolder: () => {
      return t('datatable.thead.currency');
    },
  },
  {
    type: 'select',
    name: 'state',
    data: stateOptions.value,
    order: 3,
    placeHolder: () => {
      return t('datatable.thead.state');
    },
  },
  {
    type: 'rangePicker',
    name: 'createDate',
    placeHolder: () => t('user_info.label.join_date'),
    order: 4,
  },
  {
    type: 'totalSearch',
    name: 'search',
    search: '',
    order: 5,
    placeHolder: () => {
      return t('search.placeholder.kyc');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];
const dataControl = ref({
  beforeDate: '',
  afterDate: '',
  type: defaultType,
  currency: defaultCurrency,
  state: defaultState,
  search: '',
});
const indicatorList = ref([
  { label: () => t('common.text.store'), value: 0, icon: 'partner', key: 'partnerCount' },
  { label: () => t('common.text.tvp'), value: 0, icon: 'tvp' },
  {
    label: () => t('common.text.today_registered_partner'),
    value: 0,
    icon: 'todayCreatePartner',
    key: 'todayPartnerCount',
  },
  {
    label: () => t('common.text.month_joining_partner'),
    value: 0,
    icon: 'monthCreatePartner',
    key: 'thisMonthPartnerCount',
  },
]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value ? 'small' : '',
}));
const visibleDetail = ref({});
const visibleModal = ref(false);
const partnerData = ref({});
const sendUserInfo = ref(0);
const errCode = computed(() => store.state['common'].errCode);
const columns = ref([
  {
    title: 'datatable.thead.id',
    dataIndex: 'id',
    key: 'id',
    sorter: true,
    resizable: true,
    width: 300,
  },
  {
    title: 'datatable.thead.name',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
  },
  {
    title: 'datatable.thead.type',
    key: 'grade',
    dataIndex: 'grade',
    width: '10rem',
    sorter: true,
  },
  {
    title: 'datatable.thead.primary_currency',
    dataIndex: 'currency_Type',
    key: 'currency_Type',
    sorter: true,
  },
  {
    title: 'datatable.thead.rate',
    dataIndex: 'rate',
    key: 'rate',
    width: '10rem',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.guarantee',
    dataIndex: 'guarantee',
    key: 'guarantee',
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
    title: 'common.label.request_date',
    dataIndex: 'date',
    key: 'date',
    sorter: true,
  },
  {
    title: 'datatable.thead.deposit_closing_date',
    dataIndex: 'deposit_Closing_Date',
    key: 'deposit_Closing_Date',
    sorter: true,
    hidden: true,
  },
]);
const innerColumns = ref([
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    key: 'coin_Cd',
    width: '10%',
  },
  {
    title: 'datatable.thead.wallet_address',
    dataIndex: 'addr',
    key: 'addr',
    width: '60%',
  },
  {
    title: 'datatable.thead.destination_tag',
    dataIndex: 'tag',
    key: 'tag',
    width: '10%',
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'balance',
    key: 'balance',
    align: 'right',
    width: '20%',
  },
]);
const getFilterData = (val) => {
  const temp = deepCopy(val);

  dataControl.value = {
    beforeDate: temp.createDate[0],
    afterDate: temp.createDate[1],
    type: temp.type.length > 0 ? temp.type : defaultType,
    currency: temp.currency.length > 0 ? temp.currency : defaultCurrency,
    state: temp.state.length > 0 ? temp.state : defaultState,
    search: temp.search,
  };
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const accessName = (val) => {
  const result = accessList.filter((e) => e.idx === val)[0];
  return result !== undefined ? result.name : '';
};

const queryData = async (params) => {
  pageCurrent.value = params.page;

  try {
    const response = await PartnerList({
      CurrentPage: params.page,
      CurrentPageSize: params.results,
      BeforeDate: dataControl.value.beforeDate,
      AfterDate: dataControl.value.afterDate,
      type: dataControl.value.type,
      currency: dataControl.value.currency,
      State: isTopMenu.value ? [Enum.userStateType.Request] : dataControl.value.state,
      Search: dataControl.value.search,
      Order: params.sortOrder === undefined ? '' : params.sortField,
      Sort:
        params.sortOrder !== undefined && params.sortOrder === 'ascend'
          ? 'asc'
          : params.sortOrder !== undefined && params.sortOrder === 'descend'
          ? 'desc'
          : '',
    });
    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

      response.data.returnData.list.map((e) => {
        e.user_Id = e.id;
      });

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

const handleTableChange = (pag, filters, sorter) => {
  totalCount.value = pag.total === undefined ? totalCount.value : pag.total;
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

const sendConfirmationEmail = async (sn) => {
  await store.dispatch('partner/partnerApprovalGuaranteeMailSend', { User_Sn: sn });
};

const openNotificationWithIcon = (type, msg) => {
  if (type !== '') {
    notification[type]({
      message: msg,
    });
  }

  setTimeout(() => {
    approvalGuaranteeMsg.value.type = '';
    approvalGuaranteeMsg.value.message = '';
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }, 1000);
};

const successModal = (msg) => {
  Modal.success({
    title: msg,
    onOk() {
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
      store.state['partner'].refusalSuccess = '';
      // closeDetail(false);
    },
  });
};

const errorModal = (msg) => {
  Modal.error({
    title: msg,
    onOk() {
      store.state['partner'].refusalError = '';
    },
  });
};

const openDetail = (e) => {
  visibleDetail.value = e;
  setTimeout(() => {
    visibleDetail.value = {};
  }, 1);

  // visibleDetail.value = true;
  // partnerData.value = e;
};

// const closeDetail = (e) => {
//   visibleDetail.value = e;
//   if (!isTopMenu.value) handleTableChange({ page: pageCurrent.value, results: selectedPageSize.value.value }, {}, {});
// };

const showRefusalModal = (sn) => {
  visibleModal.value = true;
  sendUserInfo.value = sn;
};

const closeRefusalModal = (e) => {
  visibleModal.value = e;
};

const getIndicatorData = async () => {
  try {
    const response = await apis.manager.PartnerIndicators();
    const getData = response.data;

    if (getData.errCode === 0) {
      indicatorList.value.forEach((e) => {
        Object.keys(getData.returnData).forEach((el) => {
          if (e.key === el) {
            e.value = getData.returnData[el];
          }
        });
      });
    }
  } catch (error) {
    console.error(error);
  }
};
const refresh = () => {
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

watch(errorMsg, (val) => {
  if (val !== '') {
    errorModal(t('confirm.title.error'));
  }
});
watch(successMsg, (val) => {
  if (val !== '') {
    successModal(t('confirm.description.success_saved'));
  }
});
watch(approvalGuaranteeMsg.value, (val) => {
  openNotificationWithIcon(val.type, val.message);
});
watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
onBeforeMount(async () => {
  await store.dispatch('sign/coinList');
  await store.dispatch('sign/currencyList');
  await getIndicatorData();

  if (isTopMenu.value) {
    columns.value = columns.value.filter((e) => !e.hidden);
  }
});
</script>
