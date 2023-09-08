<template>
  <a-card :title="$t('drawer.card_title.user_info')" size="small" :bordered="false" class="mb-gap">
    <a-row class="info-box" :gutter="[48, 12]">
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.plan') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="text">{{ props.info.month }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.start_date') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="text">{{ props.info.start_Date }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.round') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="text">{{ props.info.rotation }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.end_date') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="text">{{ props.info.end_Date }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.exchange') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="text">{{ props.info.exchange_Cd }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.state') }}</label>
      </a-col>
      <a-col :span="6">
        <span :class="` text ${memberType.filter((e) => e.value === props.info?.state)[0]?.color}`">{{
          memberType.filter((e) => e.value === props.info?.state)[0]?.text
        }}</span>
      </a-col>
      <a-col :span="6">
        <label class="label">{{ $t('drawer.label.memo') }}</label>
      </a-col>
      <a-col :span="6">
        <span class="memo">{{ props.info.memo }}</span>
      </a-col>
    </a-row>
  </a-card>

  <a-table
    class="datatable"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :showSorterTooltip="false"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';
import { GetPassqPaymentDetail } from '@/store/api';

const store = useStore();
const memberType = computed(() => store.state['common'].memberType);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  sn: {
    type: Number,
    required: true,
  },
  info: {
    type: Object,
    required: true,
  },
});

const pageSizeOptions = computed(() => store.state['common'].pageSize);
const selectedPageSize = ref(pageSizeOptions.value[0]);
const totalCount = ref(0);

const columns = [
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.exchange',
    dataIndex: 'exchange_Cd',
  },
  {
    title: 'datatable.thead.months',
    dataIndex: 'month',
  },
  {
    title: 'datatable.thead.pay_value',
    dataIndex: 'pay_Val',
    align: 'right',
  },
  {
    title: 'datatable.thead.round',
    dataIndex: 'rotation',
    align: 'right',
  },
  {
    title: 'datatable.thead.start_date',
    dataIndex: 'start_Date',
  },
  {
    title: 'datatable.thead.end_date',
    dataIndex: 'end_Date',
  },
];

const queryData = async (e) => {
  try {
    const response = await GetPassqPaymentDetail({
      Sn: props.sn,
      CurrentPage: e.page,
      CurrentPageSize: e.results,
    });
    if (response?.data.errCode === 0) {
      const getData = response.data.returnData;
      const count = response.data.returnData.totalCount;
      totalCount.value = count === null ? totalCount.value : count.count;

      return getData.list;
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
