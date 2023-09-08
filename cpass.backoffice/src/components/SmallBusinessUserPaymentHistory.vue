<template>
  <SendPushForm />
  <div class="search-area">
    <div class="row">
      <label class="label">Date</label>
      <div class="item">
        <DateRangePicker @clickFn="changeDate" :isEmpty="true" />
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.coin') }}</label>
      <div class="item">
        <a-checkbox v-model:checked="checkAll.checked" :value="checkAll.value" @change="coinChange(checkAll)">
          {{ checkAll.label }}
        </a-checkbox>
        <a-checkbox
          v-for="(item, index) in coinCheckOptions"
          :key="index"
          v-model:checked="item.checked"
          :value="item.value"
          class=""
          @change="coinChange(item)"
        >
          {{ item.label }}
        </a-checkbox>
      </div>
    </div>
    <div class="row">
      <label class="label">{{ $t('search.label.advanced_search') }}</label>
      <div class="item">
        <div class="search-box">
          <a-select v-model:value="searchValue.searchType" label-in-value :options="searchType" />
          <a-input-search
            v-model:value="searchValue.search"
            p:placeholder="$t('search.placeholder.search_text')"
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
      <h4 class="title">Users Payment Information List</h4>
      <a-select
        v-model:value="selectedPageSize"
        label-in-value
        :options="pageSizeOptions"
        @change="selectPageSize"
      ></a-select
    ></template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'date'">
        <span class="">{{ record.date }}</span>
      </template>
      <template v-if="column.dataIndex === 'partner_ID'">
        <span class="">{{ record.partner_ID }}</span>
      </template>
      <template v-if="column.dataIndex === 'partner_Name'">
        <span class="">{{ record.partner_Name }}</span>
      </template>
      <template v-if="column.dataIndex === 'user_Id'">
        <span class="">{{ record.user_Id }}</span>
      </template>
      <template v-if="column.dataIndex === 'store_Id'">
        <span class="">{{ record.store_Id }}</span>
      </template>
      <template v-if="column.dataIndex === 'coin'">
        <span class="">{{ record.coin }}</span>
      </template>
      <template v-if="column.dataIndex === 'amount'">
        <span class="">{{ comma(record.amount) }}</span>
      </template>
      <template v-if="column.dataIndex === 'settlement_amount'">
        <span class="">{{ comma(record.settlement_amount) }}</span>
      </template>
      <template v-if="column.dataIndex === 'confirm'">
        <a-typography-text v-if="record.confirm" type="success" class="">Confirm</a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
        <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'confirmation_number'">
        <span class="">{{ record.confirmation_number }}</span>
      </template>
      <template v-if="column.dataIndex === 'order_No'">
        <span class="">{{ record.order_No }}</span>
      </template>
      <template v-if="column.dataIndex === 'product'">
        <span class="">{{ record.product }}</span>
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        <span class="">{{ record.currency_Type }}</span>
      </template>
      <template v-if="column.dataIndex === 'purchase_price'">
        <span class="">{{ comma(record.purchase_price) }}</span>
      </template>
    </template>
  </a-table>
</template>
<script setup>
import SendPushForm from '@/components/partner/SendPushForm.vue';
import DateRangePicker from '@/components/common/DateRangePicker.vue';
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy } from '@/assets/js/global.js';
import { CSmasterPaymentInformationList } from '@/store/api';

const store = useStore();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const coinList = computed(() => store.state['sign'].coinList);
const errCode = computed(() => store.state['common'].errCode);

const checkAll = ref({ value: '', label: 'All', checked: true });
const coinCheckOptions = ref(coinList.value);

const searchType = ref([
  { value: 1, label: 'User Id' },
  { value: 4, label: 'Partner Id' },
  { value: 5, label: 'Partner Name' },
  { value: 2, label: 'search.select.store_id' },
  { value: 3, label: 'search.select.confirmation_number' },
]);

const searchValue = ref({
  beforeDate: '',
  afterDate: '',
  coins: '0,1,2,3,4',
  searchType: searchType.value[0],
  search: '',
});

const dataControl = ref({
  beforeDate: '',
  afterDate: '',
  coins: '0,1,2,3,4',
  searchType: searchType.value[0],
  search: '',
});

const coinChange = (item) => {
  if (item.value === '') {
    if (item.checked) {
      coinCheckOptions.value.forEach((each) => {
        each.checked = true;
      });
    } else {
      coinCheckOptions.value.forEach((each) => {
        each.checked = false;
      });
    }
    searchValue.value.coins = '0.1,2,3,4';
  } else {
    if (checkAll.value.checked === true && item.checked === false) {
      checkAll.value.checked = false;
    }
    const items = coinCheckOptions.value.filter((each) => each.checked === true);
    checkAll.value.checked = items.length === coinCheckOptions.value.length ? true : false;

    searchValue.value.coins = '';
    items.forEach((checkedEach) => {
      searchValue.value.coins = searchValue.value.coins + checkedEach.value;
    });
    searchValue.value.coins = searchValue.value.coins.split('').join(',');
  }
};

const changeDate = (day) => {
  searchValue.value.beforeDate = day[0];
  searchValue.value.afterDate = day[1];
};

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const columns = ref([
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_id',
    dataIndex: 'partner_ID',
    key: 'partner_ID',
    sorter: true,
  },
  {
    title: 'datatable.thead.partner_name',
    dataIndex: 'partner_Name',
    key: 'partner_Name',
    sorter: true,
  },
  {
    title: 'User Id',
    dataIndex: 'user_Id',
    key: 'user_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.store_id',
    dataIndex: 'store_Id',
    key: 'store_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin',
    key: 'coin',
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
    dataIndex: 'settlement_amount',
    key: 'settlement_amount',
    align: 'right',
    sorter: true,
  },
  {
    title: 'Confirm',
    dataIndex: 'confirm',
    key: 'confirm',
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
    dataIndex: 'confirmation_number',
    key: 'confirmation_number',
    sorter: true,
  },
  {
    title: 'Order No.',
    dataIndex: 'order_No',
    key: 'order_No',
    align: 'right',
    sorter: true,
  },
  {
    title: 'Product',
    dataIndex: 'product',
    key: 'product',
    sorter: true,
  },
  {
    title: 'datatable.thead.currency',
    dataIndex: 'currency_Type',
    key: 'currency_Type ',
    sorter: true,
  },
  {
    title: 'Purchase Price',
    dataIndex: 'purchase_price',
    key: 'purchase_price ',
    align: 'right',
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
    BeforeDate: dataControl.value.beforeDate,
    AfterDate: dataControl.value.afterDate,
    Coin_Cd: dataControl.value.coins,
    Search_Type: dataControl.value.searchType.value,
    Search: dataControl.value.search,
    Order: order,
    Sort: sort,
  };

  try {
    const response = await CSmasterPaymentInformationList(data);

    if (response?.data.errCode === 0) {
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return response.data.returnData.payments;
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
</script>
