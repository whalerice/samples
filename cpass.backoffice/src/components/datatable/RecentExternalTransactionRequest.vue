<template>
  <a-card size="small" class="card-in-table recent-external-transaction" :bordered="false">
    <template #title>{{ $t('component.title.external_transaction') }}</template>
    <template #extra>
      <div class="control-box">
        <a-radio-group v-model:value="isMobile" button-style="solid" class="mr-5">
          <a-radio-button :value="true"><fa-icon icon="fa-solid fa-list" /></a-radio-button>
          <a-radio-button :value="false"><fa-icon icon="fa-solid fa-table" /></a-radio-button>
        </a-radio-group>
      </div>

      <router-link to="/manager/wallet/external-transaction" class="btn-shortcut">
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
          <span v-if="column.dataIndex !== 'amount' && column.dataIndex !== 'state'">{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'amount'">
          {{ comma(record.amount) }}
        </template>
        <template v-if="column.dataIndex === 'state'">
          {{
            record.state === -1
              ? $t('search.label.waiting_1st_approval')
              : record.state === 0
              ? $t('search.label.waiting_2nd_approval')
              : record.state === 1
              ? $t('datatable.text.waiting_transmission')
              : record.state === 4
              ? $t('search.label.1st_refusal_approval')
              : $t('search.label.2nd_refusal_approval')
          }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { usePagination } from 'vue-request';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';
import { RecentWithdrawList } from '@/store/api';

const store = useStore();
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const isMobile = ref(isDeviceMobile.value);

const columns = [
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    align: 'right',
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
  },
];

const queryData = async (e) => {
  try {
    const response = await RecentWithdrawList();
    if (response?.data.errCode === 0) {
      const getData = response.data.returnData;
      return getData;
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
</script>
