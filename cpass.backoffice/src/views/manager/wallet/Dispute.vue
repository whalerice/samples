<template>
  <FilterContainer
    v-if="!(isTopMenu || isWallet)"
    class="mb-10 filter-container"
    :data="filterData"
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
  >
    <template #title v-if="!(isTopMenu || isWallet)">
      <h4 class="title">
        <span class="mr-10">
          {{ $t('nav.dispute_adjustment') }}
        </span>
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
            column.dataIndex !== 'receiver_Id' &&
            column.dataIndex !== 'sender_Id' &&
            column.dataIndex !== 'coin_Cd' &&
            column.dataIndex !== 'actual' &&
            column.dataIndex !== 'amount' &&
            column.dataIndex !== 'is_Check'
          "
          >{{ text }}</span
        >
      </template>
      <template v-if="column.dataIndex === 'receiver_Id'">
        <a-typography-link @click="onShowDrawer(record)">{{ record.receiver_Id }}</a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'sender_Id'">
        <a-typography-link @click="onShowDrawer(record)">{{ record.sender_Id }}</a-typography-link>
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        <span>{{ matchingCoinLabel(record?.coin_Cd) }}</span>
      </template>
      <template v-if="column.dataIndex === 'actual'">
        <span>
          {{ comma(record.actual) }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'amount'">
        <span>
          {{ comma(record.amount) }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'is_Check'">
        <template v-if="!getDisputeStateType(t, text).value">
          <a-typography-text class="mr-10">
            {{ getDisputeStateType(t, text).label() }}
          </a-typography-text>
          <a-button shape="round" size="small" @click="check(record.trade_Idx)">
            {{ $t('search.label.check_contents') }}
          </a-button>
        </template>
        <template v-else>
          <a-typography-text>
            {{ getDisputeStateType(t, text).label() }}
          </a-typography-text>
        </template>
      </template>
    </template>
  </a-table>
  <DetailDrawer :show="visible" @close="onCloseDrawer" :info="sendData" type="dispute" />
</template>

<script setup>
import DetailDrawer from '@/components/drawers/DetailDrawer.vue';
import FilterContainer from '@/components/filter/FilterContainer.vue';

import { usePagination } from 'vue-request';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import {
  comma,
  deepCopy,
  matchingCoinLabel,
  openNotificationWithIcon,
  getDisputeStateType,
} from '@/assets/js/global.js';
import { SafetyDisputeList } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api.js';

const { t } = useI18n();
const store = useStore();
const props = defineProps({
  type: String,
  sn: Number,
});
const isWallet = computed(() => props.type === 'wallet');
const isTopMenu = computed(() => props.type === 'topMenu');
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const isRefresh = computed(() => store.state['manager'].managerTopMenu.dispute);
const coinList = computed(() => store.state['sign'].coinList);
const errCode = computed(() => store.state['common'].errCode);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const defaultCoin = Object.values(coinList.value).map((e) => e.value);

const dataControl = ref({
  BeforeDate: '',
  AfterDate: '',
  coin_Cd: defaultCoin,
  searchType: 0,
  search: '',
  isCheck: null,
});
let columns = [
  {
    title: 'common.label.occurrence_date',
    dataIndex: 'addtime',
    sorter: true,
  },
  {
    title: 'datatable.thead.receiver_id',
    dataIndex: 'receiver_Id',
    sorter: true,
    width: '15%',
  },
  {
    title: 'datatable.thead.sender_id',
    dataIndex: 'sender_Id',
    sorter: true,
    width: '15%',
    wallet: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    sorter: true,
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'is_Check',
    sorter: true,
    align: 'left',
    className: 'btn-cell',
  },
];
const totalCount = ref(0);
const searchText = ref('');
const selectedPageSize = ref(pageSizeOptions.value[0]);
const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
  size: isTopMenu.value || isWallet.value ? 'small' : '',
}));
const visible = ref(false);
const sendData = ref({});

const onShowDrawer = async (record) => {
  sendData.value = record;
  visible.value = true;
};

const onCloseDrawer = () => {
  visible.value = false;
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const queryData = async (e) => {
  let sort;
  e.sortOrder === 'ascend' && e.sortOrder !== undefined
    ? (sort = 'asc')
    : e.sortOrder === 'descend' && e.sortOrder !== undefined
    ? (sort = 'desc')
    : (sort = '');
  let order = e.sortOrder === undefined ? '' : e.sortField;

  try {
    const response = await SafetyDisputeList({
      userSn: isWallet.value ? props.sn : 0,
      currentPage: e.page,
      CurrentPageSize: e.results,
      CoinCd: dataControl.value.coin_Cd,
      BeforeDate: dataControl.value.BeforeDate,
      AfterDate: dataControl.value.AfterDate,
      Search: dataControl.value.search,
      Order: order,
      Sort: sort,
      IsCheck: isTopMenu.value ? false : dataControl.value.isCheck,
    });

    if (errCode.value === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null || count === undefined ? totalCount.value : count.count;

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
  total,
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

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

const coinOption = computed(() =>
  coinList.value.map((e) => {
    e.checked = false;
    return e;
  }),
);

const stateOption = ref(getDisputeStateType(t));
const filterData = [
  {
    type: 'rangePicker',
    name: 'addtime',
    placeHolder: () => t('common.label.occurrence_date'),
    order: 1,
  },
  {
    type: 'select',
    name: 'coin',
    data: coinOption.value,
    order: 2,
    placeHolder: () => {
      return t('search.label.coin');
    },
  },
  {
    type: 'select',
    name: 'state',
    data: stateOption.value,
    order: 3,
    placeHolder: () => {
      return t('search.label.state');
    },
  },
  {
    type: 'totalSearch',
    name: 'totalSearch',
    order: 4,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.receiver_sender_id');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];
const topMenuRefresh = async () => {
  await store.dispatch('manager/setTopMenuRefresh');
};
const getFilterData = (val) => {
  const temp = deepCopy(val);

  dataControl.value = {
    BeforeDate: temp.addtime[0],
    AfterDate: temp.addtime[1],
    coin_Cd: temp.coin.length === 0 ? defaultCoin : temp.coin,
    search: temp.totalSearch,
    isCheck: temp.state.length === 2 ? null : temp.state[0],
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
const check = async (tradeIdx) => {
  try {
    const response = await apis.manager.SafetyDisputeCheck({
      trade_Idx: tradeIdx,
    });
    const getData = response.data;

    if (getData.returnData) {
      handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
      openNotificationWithIcon('success', t('notification.title.success'), '');
    } else {
      openNotificationWithIcon('error', t('notification.title.error'), getData.errMessage);
    }
    topMenuRefresh();
  } catch (error) {
    console.error(error);
  }
};
watch(isRefresh, (val) => {
  if (val) {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
watch(searchText, (val) => {
  if (val === '') {
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
});
onBeforeMount(() => {
  if (isWallet.value) {
    columns = columns.filter((e) => !e.wallet);
  }
});
</script>
