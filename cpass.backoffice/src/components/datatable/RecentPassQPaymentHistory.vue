<template>
  <a-card size="small" class="card-in-table recent-passq-payment" :bordered="false">
    <template #title>{{ $t('component.title.passq_payment_history') }}</template>
    <template #extra>
      <div class="control-box">
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
      </div>
      <router-link to="/passq-payment-history" class="btn-shortcut">
        <span>{{ $t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>
    </template>
    <a-table
      :class="['datatable', { 'is-mobile': isMobile }]"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :loading="loading"
      :scroll="{ x: true }"
      @change="handleTableChange"
    >
      <template #headerCell="{ title }"> {{ $t(title) }}</template>
      <template #bodyCell="{ column, record, text }">
        <template v-if="isMobile">
          {{ $t(column.title) }} :
          <span
            v-if="
              column.dataIndex !== 'pay_Val' && column.dataIndex !== 'coin_Cd' && column.dataIndex !== 'exchange_Cd'
            "
            >{{ text }}</span
          >
        </template>
        <template v-if="column.dataIndex === 'pay_Val'">
          <span>{{ comma(record?.pay_Val) }}</span>
        </template>
        <template v-if="column.dataIndex === 'coin_Cd'">
          <span>{{ matchingCoinLabel(record?.coin_Cd) }}</span>
        </template>
        <template v-if="column.dataIndex === 'exchange_Cd'">
          <span>{{ record.exchange_Cd === 1 ? 'Binance' : 'Upbit' }}</span>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { usePagination } from 'vue-request';
import { computed, onMounted, ref, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { comma, matchingCoinLabel } from '@/assets/js/global.js';
import { GetRecentPaymentList } from '@/store/api';

const store = useStore();
const followersSn = computed(() => store.state['sign'].followersSn);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const columns = [
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
  },
  {
    title: 'datatable.thead.exchange',
    dataIndex: 'exchange_Cd',
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.plan',
    dataIndex: 'month',
    align: 'right',
  },
  {
    title: 'datatable.thead.round',
    dataIndex: 'rotation',
    align: 'right',
  },
  {
    title: 'datatable.thead.price',
    dataIndex: 'pay_Val',
    align: 'right',
  },
  {
    title: 'datatable.thead.transaction_time',
    dataIndex: 'addtime',
  },
];

const queryData = async (e) => {
  try {
    const response = await GetRecentPaymentList({ Sn: followersSn.value });
    if (response?.data.errCode === 0) {
      return response.data.returnData;
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
  run({
    results: pag.pageSize ? pag.pageSize : pag.results,
    page: pag.current ? pag.current : pag.page,
    sortField: sorter.field,
    sortOrder: sorter.order,
  });
};

onMounted(() => {
  handleTableChange({ page: 1, results: 10 }, {}, {});
});

onBeforeMount(async () => {
  await store.dispatch('sign/coinList');
});
</script>
