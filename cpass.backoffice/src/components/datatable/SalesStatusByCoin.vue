<template>
  <a-table
    :bordered="!isMobile"
    :class="['datatable', { 'is-mobile': isMobile }]"
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    :showSorterTooltip="false"
    :loading="loading"
    :scroll="{ x: true }"
    @resizeColumn="handleResizeColumn"
  >
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, text }">
      <template v-if="isMobile"> {{ $t(column.title) }} : </template>
      <template v-if="column.dataIndex === 'coin_Cd'"> {{ matchingCoinLabel(text) }}</template>
      <template v-if="column.dataIndex === 'deposit_Amount'"> {{ comma(text) }}</template>
      <template v-if="column.dataIndex === 'withdrawal_Amount'"> {{ comma(text) }} </template>
      <template v-if="column.dataIndex === 'sum_Fee'"> {{ comma(text) }}</template>
      <template v-if="column.dataIndex === 'sum_Price'"> {{ comma(text) }} </template>
    </template>
  </a-table>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { usePagination } from 'vue-request';
import { apis } from '@/store/api';
import { useI18n } from 'vue-i18n';
import { matchingCoinLabel, comma } from '@/assets/js/global.js';

const { t } = useI18n();
const store = useStore();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const columns = ref([
  {
    title: 'datatable.thead.sortation',
    dataIndex: 'coin_Cd',
    width: '5%',
    align: 'center',
  },
  {
    title: 'search.select.deposit',
    dataIndex: 'deposit_Amount',
    width: '10%',
    align: 'right',
  },
  {
    title: 'search.select.withdrawal',
    dataIndex: 'withdrawal_Amount',
    width: '10%',
    align: 'right',
  },
  {
    title: 'datatable.thead.fee',
    dataIndex: 'sum_Fee',
    align: 'right',
    width: '12%',
  },
  {
    title: 'datatable.thead.total_amount',
    dataIndex: 'sum_Price',
    align: 'right',
    width: '12%',
  },
]);

const queryData = async (params) => {
  try {
    const response = await apis.PaymentSalesStatusCoin();

    if (response?.data.errCode === 0) {
      return response.data.returnData;
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

onBeforeMount(async () => {});
</script>
