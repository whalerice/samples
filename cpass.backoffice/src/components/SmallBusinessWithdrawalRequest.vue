<template>
  <SendPushForm />
  <div class="search-area">
    <div class="row">
      <label class="label">{{ $t('search.label.request_date') }}</label>
      <div class="item">
        <DateRangePicker @clickFn="changeDate" :isEmpty="true" />
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.concluded_date') }}</label>
      <div class="item">
        <DateRangePicker @clickFn="changeDate2" :isEmpty="true" />
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.state') }}</label>
      <div class="item">
        <a-checkbox v-model:checked="checkAll.checked" :value="checkAll.value" @change="stateChange(checkAll)">
          {{ checkAll.label }}
        </a-checkbox>
        <a-checkbox
          v-for="(item, index) in stateCheckOptions"
          :key="index"
          v-model:checked="item.checked"
          :value="item.value"
          class=""
          @change="stateChange(item)"
        >
          {{ item.label }}
        </a-checkbox>
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.advanced_search') }}</label>
      <div class="item">
        <div class="search-box">
          <a-select v-model:value="searchValue.searchType" placeholder="Id" label-in-value :options="searchType" />

          <a-input-search
            v-model:value="searchValue.search"
            :placeholder="$t('search.placeholder.search_text')"
            enter-button
            @search="onSearch"
          />
        </div>
      </div>
    </div>
  </div>

  <a-table
    class="datatable"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
  >
    <template #title>
      <h4 class="title">Users Withdrawal Request List</h4>
      <a-select
        v-model:value="selectedPageSize"
        label-in-value
        :options="pageSizeOptions"
        @change="selectPageSize"
      ></a-select
    ></template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'requestDate'">
        <span class="">{{ record.requestDate }}</span>
      </template>
      <template v-if="column.dataIndex === 'approvalDate'">
        <span class="">{{ record.approvalDate }}</span>
      </template>
      <template v-if="column.dataIndex === 'partnerId'">
        <span class="">{{ record.partnerId }}</span>
      </template>
      <template v-if="column.dataIndex === 'partner_Name'">
        <span class="">{{ record.partner_Name }}</span>
      </template>
      <template v-if="column.dataIndex === 'user_Id'">
        <span class="">{{ record.user_Id }}</span>
      </template>
      <template v-if="column.dataIndex === 'amount'">
        <span class="">{{ comma(record.amount) }}</span>
      </template>
      <template v-if="column.dataIndex === 'actual'">
        <span class="">{{ comma(record.actual) }}</span>
      </template>
      <template v-if="column.dataIndex === 'fee'">
        <span class="">{{ comma(record.fee) }}</span>
      </template>
      <template v-if="column.dataIndex === 'approvalNumber'">
        <span class="">{{ record.approvalNumber }}</span>
      </template>
      <template v-if="column.dataIndex === 'state'">
        <!-- <template
          v-if="
            record.state === 'Request' && (signInfo.grade === auth.Supermaster || signInfo.grade === auth.Developer)
          "
        >
          <a-button danger size="small" shape="round" @click="showRefusalModal(record.deal_Id)">Refusal</a-button>
          <a-button type="primary" size="small" shape="round" @click="showApprovalModal(record.deal_Id)"
            >Approval</a-button
          >
        </template> -->
        <a-typography-text
          v-if="record.state === 'Approval'"
          :type="record.state === 'Approval' ? 'success' : record.state === 'Refusal' ? 'danger' : ''"
          class=""
          >{{ record.state }}</a-typography-text
        >
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import SendPushForm from '@/components/partner/SendPushForm.vue';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import { ref, computed, watch, createVNode } from 'vue';
import { useStore } from 'vuex';
import { notification } from 'ant-design-vue';
import { usePagination } from 'vue-request';
import { useI18n } from 'vue-i18n';

import { CSmasterWithdrawalRequestList } from '@/store/api';
import { comma, deepCopy } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const signInfo = computed(() => store.state['sign'].signInfo);
const withdrawStateMsg = computed(() => store.state['partner'].withdrawStateMsg);
const errCode = computed(() => store.state['common'].errCode);

const checkAll = ref({ value: '', label: 'All', checked: true });
const stateCheckOptions = ref([
  { value: 1, label: 'Request', checked: true },
  { value: 2, label: 'Approval', checked: true },
  { value: 3, label: 'Refusal', checked: true },
]);

const searchType = ref([
  { value: 1, label: 'User Id' },
  { value: 2, label: 'Partner Id' },
  { value: 3, label: 'Partner Name' },
  { value: 4, label: 'Confirmation Number' },
]);

const searchValue = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  state: '0,1,2,3',
  searchType: searchType.value[0],
  search: '',
});

const dataControl = ref({
  requestBeforeDate: '',
  requestAfterDate: '',
  concludeBeforeDate: '',
  concludeAfterDate: '',
  state: '0,1,2,3',
  searchType: searchType.value[0],
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
    dataIndex: 'requestDate',
    key: 'requestDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.concluded_date',
    dataIndex: 'approvalDate',
    key: 'approvalDate',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_id',
    dataIndex: 'partnerId',
    key: 'partnerId',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_name',
    dataIndex: 'partner_Name',
    key: 'partner_Name',
    sorter: true,
  },
  {
    title: 'datatable.thead.user_id',
    dataIndex: 'user_Id',
    key: 'user_Id',
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
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    key: 'actual',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'fee',
    key: 'fee',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.confirmation_number',
    dataIndex: 'approvalNumber',
    key: 'approvalNumber',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    className: 'btn-cell',
    width: '22rem',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
    key: 'addr',
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

  const data = {
    CurrentPage: params.page,
    CurrentPageSize: params.results,
    requestBeforeDT: dataControl.value.requestBeforeDate,
    requestAfterDT: dataControl.value.requestAfterDate,
    concludeBeforeDT: dataControl.value.concludeBeforeDate,
    concludeAfterDT: dataControl.value.concludeAfterDate,
    State: dataControl.value.state,
    Search_Type: dataControl.value.searchType.value,
    Search: dataControl.value.search,
    Order: order,
    Sort: sort,
  };

  try {
    const response = await CSmasterWithdrawalRequestList(data);

    if (response?.data.errCode === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

      return response.data.returnData.withdrawalRequests;
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

const onSearch = () => {
  dataControl.value = deepCopy(searchValue.value);
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};

const handleResizeColumn = (w, col) => {
  col.width = w;
};

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};
const stateChange = (item) => {
  if (item.value === '') {
    if (item.checked) {
      stateCheckOptions.value.forEach((each) => {
        each.checked = true;
      });
    } else {
      stateCheckOptions.value.forEach((each) => {
        each.checked = false;
      });
    }
    searchValue.value.state = '0,1,2,3';
  } else {
    if (checkAll.value.checked === true && item.checked === false) {
      checkAll.value.checked = false;
    }
    const items = stateCheckOptions.value.filter((each) => each.checked === true);
    checkAll.value.checked = items.length === stateCheckOptions.value.length ? true : false;

    searchValue.value.state = '';
    items.forEach((checkedEach) => {
      searchValue.value.state = searchValue.value.state + checkedEach.value;
    });
    searchValue.value.state = searchValue.value.state.split('').join(',');

    if (searchValue.value.state.length === 0) {
      searchValue.value.state = '0,1,2,3';
    }
  }
};

const changeDate = (day) => {
  searchValue.value.requestBeforeDate = day[0];
  searchValue.value.requestAfterDate = day[1];
};
const changeDate2 = (day) => {
  searchValue.value.concludeBeforeDate = day[0];
  searchValue.value.concludeAfterDate = day[1];
};

const openNotification = (val) => {
  notification['success']({
    message: t('notification.title.success'),
    description: val,
  });
};

watch(withdrawStateMsg, (val) => {
  openNotification(val.returnData);
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
});
</script>
