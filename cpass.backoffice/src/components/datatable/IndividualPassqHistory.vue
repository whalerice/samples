<template>
  <a-table
    class="datatable"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  >
    <template #title>
      <h4 class="title">
        <span class="text">{{ $t(props.title) }}</span>
        <span class="total">{{ $t('common.text.total') }} {{ totalCount }}</span>
      </h4>
      <a-select
        v-model:value="selectedPageSize"
        label-in-value
        :options="pageSizeOptions"
        @change="selectPageSize"
      ></a-select>
    </template>
    <template #headerCell="{ title }"> {{ $t(title) }}</template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'pay_Val'">
        {{ comma(record.pay_Val) }}
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { usePagination } from 'vue-request';
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';
import { ReferralPaymentHistory } from '@/store/api';

const store = useStore();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  sn: {
    type: Number,
    required: true,
  },
});

const pageSizeOptions = computed(() => store.state['common'].pageSize);
let selectedPageSize = ref(pageSizeOptions.value[0]);
const totalCount = ref(0);

const columns = [
  {
    title: 'datatable.thead.id',
    dataIndex: 'payment_User',
  },
  {
    title: 'datatable.thead.pay_gb',
    dataIndex: 'pay_Gb',
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.exchange',
    dataIndex: 'exchange_Cd',
  },
  {
    title: 'datatable.thead.pay_value',
    dataIndex: 'pay_Val',
    align: 'right',
  },
];

const queryData = async (e) => {
  const data = {
    Sn: props.sn,
    CurrentPage: e.page,
    CurrentPageSize: e.results,
  };

  try {
    const response = await ReferralPaymentHistory(data);
    if (response?.data.errCode === 0) {
      const getData = response.data.returnData;
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;
      return getData.paymentLists;
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

const selectPageSize = (e) => {
  selectedPageSize.value = e;
  handleTableChange({ page: 1, results: e.value }, {}, {});
};

onMounted(() => {
  handleTableChange({ page: 1, results: 10 }, {}, {});
});

watch(props, () => {
  if (selectedPageSize.value.value !== 10) {
    selectedPageSize.value = pageSizeOptions.value[0];
  }
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
});
</script>
