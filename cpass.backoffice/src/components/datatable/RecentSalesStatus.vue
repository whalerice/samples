<template>
  <a-table
    class="widget-padding"
    :bordered="!isMobile"
    :class="['datatable', { 'is-mobile': isMobile }, { 'mobile-border-top': !isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    :showSorterTooltip="false"
    :loading="loading"
    @resizeColumn="handleResizeColumn"
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, text }">
      <template v-if="isMobile">
        {{ $t(column.title) }} :
        <span v-if="column.dataIndex === 'request_Date'">
          {{ text }}
        </span>
        <span v-if="column.dataIndex === 'processing_Date'">
          {{ text }}
        </span>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { comma } from '@/assets/js/global.js';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const totalCount = ref(0);
const columns = ref([
  {
    title: 'datatable.thead.sortation',
    dataIndex: 'request_Date',
    width: '10%',
    align: 'center',
  },
  {
    title: 'search.select.deposit',
    dataIndex: 'payment_Type',
    width: '10%',
    align: 'center',
  },
  {
    title: 'search.select.withdrawal',
    dataIndex: 'coin_Cd',
    width: '10%',
    align: 'center',
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'actual',
    align: 'center',
    width: '12%',
  },
  {
    title: 'datatable.thead.total_amount',
    dataIndex: 'actual',
    align: 'center',
    width: '12%',
  },
]);

const queryData = async (params) => {
  try {
    const response = await apis.PartnerTransactionList({
      currentPage: 1,
      // currentPageSize: params.results,
      // req_BeforeDate: dataControl.value.requestBeforeDate,
      // req_AfterDate: dataControl.value.requestAfterDate,
      // proc_BeforeDate: dataControl.value.concludeBeforeDate,
      // proc_AfterDate: dataControl.value.concludeAfterDate,
      // activity: dataControl.value.activity,
      // state: dataControl.value.state,
      // search: '',
      // search_Type: '',
      // order: order,
      // sort: sort,
    });

    if (response?.data.errCode === 0) {
      const count = response.data.returnData?.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return response.data.returnData.list;
    }
  } catch (error) {
    console.error(error);
  }
};

const { data: dataSource, loading } = usePagination(queryData, {
  formatResult: (res) => res,
});

const handleResizeColumn = (w, col) => {
  col.width = w;
};

onBeforeMount(async () => {
  // await store.dispatch('sign/partnerMyInfo');
  // await store.dispatch('sign/partnerWalletInfo');
});
</script>
<style lang="scss">
.widget-padding {
  padding: 1.5rem;
}
.mobile-border-top {
  .ant-table-content {
    border: 0;
  }
}
</style>
