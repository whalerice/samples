<template>
  <PartnerPaymentSearch @search="getSearchData" :type="['coin', 'req', 'pro', 'search']" />
  <a-table
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
    :scroll="{ x: true }"
    @change="handleTableChange"
    @resizeColumn="handleResizeColumn"
    id="enterprise-payment"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t('datatable.title.user_payment_information_list') }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <div class="control-box">
        <DownloadCSV :csvFile="csvFile" :filename="$t('datatable.title.user_payment_information_list')" />
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
            column.dataIndex !== 'state' &&
            column.dataIndex !== 'price' &&
            column.dataIndex !== 'settlement_amount' &&
            column.dataIndex !== 'addr' &&
            column.dataIndex !== 'currency_Type' &&
            column.dataIndex !== 'coin_Cd'
          "
          >{{ text }}</span
        >
      </template>
      <template v-if="column.dataIndex === 'price'">{{ comma(record.price) }}</template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }}</template>
      <template v-if="column.dataIndex === 'settlement_amount'">{{ comma(record.settlement_Amount) }}</template>
      <template v-if="column.dataIndex === 'addr'">
        <div style="align-items: center">
          <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
          <a-typography-text class="tag" v-if="record.tag">({{ record.tag }})</a-typography-text>
        </div>
      </template>
      <template v-if="column.dataIndex === 'currency_Type'">
        {{ matchingCurrencySymbol(record?.currency_Type) }}
      </template>
      <template v-if="column.dataIndex === 'coin_Cd'">
        {{ matchingCoinLabel(record?.coin_Cd) }}
      </template>
      <template v-if="column.dataIndex === 'state'">
        <a-typography-text :type="record.state === 2 ? 'success' : record.state !== 0 ? 'danger' : ''">{{
          record.state === 2
            ? t('datatable.text.completed')
            : record.state === 0
            ? t('datatable.text.request')
            : record.state === 3
            ? t('datatable.text.cancelled_store')
            : record.state === 4
            ? t('datatable.text.expire')
            : t('datatable.text.cancelled_user')
        }}</a-typography-text>
      </template>
    </template>
  </a-table>
</template>
<script setup>
import DownloadCSV from '@/components/common/DownloadCSV.vue';
import PartnerPaymentSearch from '@/components/search/PartnerPaymentSearch.vue';
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma, deepCopy, matchingCurrencySymbol, matchingCoinLabel } from '@/assets/js/global.js';
import { useI18n } from 'vue-i18n';
import { apis } from '@/store/api';

const store = useStore();
const { t } = useI18n();
const pageSizeOptions = computed(() => store.state['common'].pageSize);
const partnerPaymentRequestListPush = computed(() => store.state['partner'].partnerPaymentRequestListPush);

const csvFile = ref();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const dataControl = ref({
  req_BeforeDate: '',
  req_AfterDate: '',
  proc_BeforeDate: '',
  proc_AfterDate: '',
  searchType: 1,
  search: '',
  state: '0,1,2,3',
  coins: '1,2,3,4,6,7',
});

const totalCount = ref(0);
const selectedPageSize = ref(pageSizeOptions.value[0]);

const columns = ref([
  {
    title: 'datatable.thead.request_date',
    dataIndex: 'request_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.processing_date',
    dataIndex: 'processing_Date',
    sorter: true,
  },
  {
    title: 'datatable.thead.cpass_id',
    dataIndex: 'cpass_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.store_id',
    dataIndex: 'store_Id',
    sorter: true,
  },
  {
    title: 'datatable.thead.order_name',
    dataIndex: 'order_Name',
    sorter: true,
  },
  {
    title: 'datatable.thead.currency',
    dataIndex: 'currency_Type',
    sorter: true,
  },
  {
    title: 'datatable.thead.price',
    dataIndex: 'price',
    key: 'price',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
    key: 'state',
    className: 'btn-cell',
    sorter: true,
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
    sorter: true,
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'datatable.thead.settlement_amount',
    dataIndex: 'settlement_Amount',
    align: 'right',
    sorter: true,
  },
  {
    title: 'datatable.thead.addr_tag',
    dataIndex: 'addr',
    sorter: true,
  },
  {
    title: 'datatable.thead.confirmation_number',
    dataIndex: 'confirmation_Number',
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
    currentPage: params.page,
    currentPageSize: params.results,
    req_BeforeDate: dataControl.value.req_BeforeDate,
    req_AfterDate: dataControl.value.req_AfterDate,
    proc_BeforeDate: dataControl.value.proc_BeforeDate,
    proc_AfterDate: dataControl.value.proc_AfterDate,
    coin_Cd: dataControl.value.coins,
    search_Type: String(dataControl.value.searchType),
    search: dataControl.value.search,
    state: dataControl.value.state,
    order: order,
    sort: sort,
  };
  try {
    const csv = await apis.PartnerPaymentRequestListPush({
      currentPage: 0,
      currentPageSize: params.results,
      req_BeforeDate: dataControl.value.req_BeforeDate,
      req_AfterDate: dataControl.value.req_AfterDate,
      proc_BeforeDate: dataControl.value.proc_BeforeDate,
      proc_AfterDate: dataControl.value.proc_AfterDate,
      coin_Cd: dataControl.value.coins,
      search_Type: String(dataControl.value.searchType),
      search: dataControl.value.search,
      state: dataControl.value.state,
      order: order,
      sort: sort,
    });

    await store.dispatch('partner/PartnerPaymentRequestListPush', data);

    if (partnerPaymentRequestListPush.value.totalCount !== null) {
      totalCount.value = partnerPaymentRequestListPush.value.totalCount?.count;
    }
    getCSV(csv.data.returnData.list);
    return partnerPaymentRequestListPush.value.list;
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

const getCSV = (data) => {
  var csv = [];
  var row = [];

  columns.value.forEach((e) => {
    row.push(t(e.title));
  });
  csv.push(row.join(','));

  data.forEach((e) => {
    row = [];
    row.push(
      e.request_Date,
      e.processing_Date,
      e.cpass_Id,
      e.store_Id,
      e.order_Name,
      matchingCurrencySymbol(e.currency_Type),
      e.price,
      matchingCoinLabel(e.coin_Cd),
      e.price,
      e.amount,
      e.settlement_Amount,
      e.addr,
      e.confirmation_Number,
    );
    csv.push(row.join(','));
  });
  csvFile.value = csv.join('\n');
};

const handleResizeColumn = (w, col) => {
  col.width = w;
};

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};
const getSearchData = (searchData) => {
  dataControl.value = deepCopy(searchData);
  dataControl.value.coins = searchData.coin;

  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
};
</script>
