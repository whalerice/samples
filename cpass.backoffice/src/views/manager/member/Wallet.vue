<template>
  <Indicators :data="indicatorList" />
  <FilterContainer class="mb-10 filter-container" :data="filterData" @getData="getFilterData" />
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    :rowKey="(index) => index"
    :rowExpandable="(record) => record?.wallet[0].coin_Cd !== null"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('nav.wallet_history') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div v-if="!isTopMenu" class="control-box">
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
            column.dataIndex !== 'user_Id' &&
            column.dataIndex !== 'country' &&
            column.dataIndex !== 'kyc_Status' &&
            column.dataIndex !== 'state'
          "
        >
          {{ text }}
        </span>
      </template>

      <template v-if="column.dataIndex === 'user_Id'">
        <MemberBtn :data="record" type="wallet" />
      </template>
      <template v-if="column.dataIndex === 'country'">
        <NationalFlag :data="record" @update="refresh" />
      </template>
      <template v-if="column.dataIndex === 'kyc_Status'">
        {{ getKycStep(t, text).label() }}
      </template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-text :type="getAccountStatusInWallet(t, text)?.color">
          {{ getAccountStatusInWallet(t, text)?.label() }}
        </a-typography-text>
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
</template>
<script setup>
import { useStore } from 'vuex';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { Enum } from '@/assets/js/enum';
import { usePagination } from 'vue-request';
import { ref, computed, watch, onBeforeMount } from 'vue';
import { comma, matchingCoinLabel, deepCopy, getAccountStatusInWallet, getKycStep } from '@/assets/js/global';

import FilterContainer from '@/components/filter/FilterContainer.vue';
import NationalFlag from '@/components/common/NationalFlag.vue';
import Indicators from '@/components/common/Indicators.vue';
import MemberBtn from '@/components/MemberBtn.vue';

const { t } = useI18n();
const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);
const indicatorList = ref([
  { label: () => t('common.text.member_cpass'), value: 0, icon: 'cpassMember', key: 'userCount' },
  {
    label: () => t('common.text.today_registered_member'),
    value: 0,
    icon: 'todayCreateMember',
    key: 'todaySignUpCount',
  },
  {
    label: () => t('common.text.month_membership'),
    value: 0,
    icon: 'monthCreateMember',
    key: 'thisMonthSignUpCount',
  },
  {
    label: () => t('common.text.today_withdrawal_member'),
    value: 0,
    icon: 'todayWithdrawMember',
    key: 'todayResignedCount',
  },
  {
    label: () => t('common.text.month_withdrawal_member'),
    value: 0,
    icon: 'monthWithdrawMember',
    key: 'thisMonthResignedCount',
  },
]);

const pagination = computed(() => ({
  total: totalCount.value,
  current: current.value,
  pageSize: pageSize.value,
}));
const defaultSortation = getAccountStatusInWallet(t);
const defaultKyc = getKycStep(t).map((e) => e.value);
const totalCount = ref(0);
const dataControl = ref({
  search: '',
  beforeDate: '',
  afterDate: '',
  alpha2Code: [],
  kycState: defaultKyc,
  state: defaultSortation,
});
const selectedPageSize = ref(pageSizeOptions.value[0]);
const kycOption = getKycStep(t);

const sortationOption = [
  {
    value: Enum.accountStatus.active,
    label: () => t('datatable.text.normal'),
    checked: false,
  },
  {
    value: Enum.accountStatus.deleted,
    label: () => t('datatable.text.delete_member'),
    checked: false,
  },
];
const filterData = [
  {
    type: 'country',
    name: 'country',
    order: 1,
  },
  {
    type: 'select',
    name: 'kyc',
    data: kycOption,
    order: 2,
    placeHolder: () => t('user_info.label.kyc'),
  },
  {
    type: 'select',
    name: 'sortation',
    data: sortationOption,
    order: 3,
    placeHolder: () => t('datatable.thead.sortation'),
  },
  {
    type: 'rangePicker',
    name: 'createdDate',
    placeHolder: () => t('user_info.label.join_date'),
    order: 4,
  },
  {
    type: 'totalSearch',
    name: 'search',
    order: 5,
    search: '',
    placeHolder: () => {
      return t('search.placeholder.member_wallet');
    },
    label: () => {
      return t('common.label.text');
    },
  },
];

const columns = [
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.name',
    dataIndex: 'name',
    sorter: true,
  },
  {
    title: 'user_info.label.nationality',
    dataIndex: 'country',
    sorter: true,
  },
  {
    title: 'user_info.label.kyc',
    dataIndex: 'kyc_Status',
    sorter: true,
  },
  {
    title: 'user_info.label.phone',
    dataIndex: 'phone_Number',
    sorter: true,
    align: 'right',
  },
  {
    title: 'user_info.label.join_date',
    dataIndex: 'addtime',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    sorter: true,
  },
];

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

const queryData = async (params) => {
  try {
    const response = await apis.manager.UserList({
      currentPage: params.page,
      currentPageSize: params.results,
      order: params.sortOrder === undefined ? '' : params.sortField,
      sort:
        params.sortOrder !== undefined && params.sortOrder === 'ascend'
          ? 'asc'
          : params.sortOrder !== undefined && params.sortOrder === 'descend'
          ? 'desc'
          : '',
      search: dataControl.value.search,
      beforeDate: dataControl.value.beforeDate,
      afterDate: dataControl.value.afterDate,
      alpha2Code: dataControl.value.alpha2Code,
      kycState: dataControl.value.kycState,
      state: dataControl.value.state,
    });

    const getData = response.data;

    if (getData.errCode === 0) {
      const count = getData.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

      return getData.returnData.list;
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

  if (temp.sortation.includes(10)) {
    temp.sortation = [20, 30, 50, ...temp.sortation];
  }

  dataControl.value = {
    search: temp.search,
    beforeDate: temp.createdDate[0],
    afterDate: temp.createdDate[1],
    alpha2Code: temp.country.map((e) => e.alpha2Code),
    kycState: temp.kyc.length > 0 ? temp.kyc : defaultKyc,
    state: temp.sortation.length > 0 ? temp.sortation : defaultSortation,
  };

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
const getIndicatorData = async () => {
  try {
    const response = await apis.manager.WalletIndicators();
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

onBeforeMount(async () => {
  getIndicatorData();
});
</script>
