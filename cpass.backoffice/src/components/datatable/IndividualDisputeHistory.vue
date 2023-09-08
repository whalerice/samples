<template>
  <a-table
    class="datatable"
    :columns="columns"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: true }"
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
      <template v-if="column.dataIndex === 'addr'">
        <a-typography-text class="addr">{{ record.addr }}</a-typography-text>
      </template>
      <template v-if="column.dataIndex === 'actual'">{{ comma(record.actual) }} </template>
      <template v-if="column.dataIndex === 'amount'">{{ comma(record.amount) }} </template>
    </template>
  </a-table>
  <div class="table-bottom" v-if="grade === 30 || grade === 95 || grade === 100">
    <a-button @click="openModal('Receiver')" :disabled="clickedBtn.adjusted">{{ $t('common.button.sender') }}</a-button>
    <a-button @click="openModal('Sender')" :disabled="clickedBtn.adjusted">{{ $t('common.button.receiver') }}</a-button>
    <a-button @click="openModal('Restore')" :disabled="clickedBtn.adjusted">{{ $t('common.button.restore') }}</a-button>
  </div>

  <DisputeAdjustmentModal :visible="visibility" :clickedBtn="clickedBtn" @close="closeModal" />
  <ConfirmPasswordModal :visible="visibility" :clickedBtn="clickedBtn" @close="closeModal" />
</template>

<script setup>
import DisputeAdjustmentModal from '@/components/modals/DisputeAdjustmentModal.vue';
import ConfirmPasswordModal from '@/components/modals/ConfirmPasswordModal.vue';
import { usePagination } from 'vue-request';
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { SafetyDetailList } from '@/store/api';
import { comma, auth, authGroup } from '@/assets/js/global.js';

const store = useStore();

const grade = computed(() => store.state['sign'].signInfo.grade);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  sn: {
    type: Number,
    required: false,
  },
  info: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    required: false,
  },
});

const pageSizeOptions = computed(() => store.state['common'].pageSize);
let selectedPageSize = ref(pageSizeOptions.value[0]);
const totalCount = ref(0);

const emit = defineEmits(['close']);

const infoProp = computed({
  get() {
    return props.info;
  },
});

const columns = [
  {
    title: 'datatable.thead.id',
    dataIndex: 'user_Id',
  },
  {
    title: 'datatable.thead.deal_type',
    dataIndex: 'deal_Type',
  },
  {
    title: 'datatable.thead.coin',
    dataIndex: 'coin_Cd',
  },
  {
    title: 'datatable.thead.addr',
    dataIndex: 'addr',
  },
  {
    title: 'datatable.thead.state',
    dataIndex: 'state',
  },
  {
    title: 'datatable.thead.actual',
    dataIndex: 'actual',
    align: 'right',
  },
  {
    title: 'datatable.thead.amount',
    dataIndex: 'amount',
    align: 'right',
  },
  {
    title: 'datatable.thead.addtime',
    dataIndex: 'addtime',
  },
];

const queryData = async (e) => {
  const data = {
    Trade_Idx: Number(infoProp.value.trade_Idx),
  };

  try {
    const response = await SafetyDetailList(data);
    if (response?.data.errCode === 0) {
      const getData = response.data.returnData;
      const count = getData?.length;
      totalCount.value = count === null || count === undefined ? totalCount.value : count;
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

const visibility = ref({
  isModalVisible: false,
  isPwModalVisible: false,
});

const clickedBtn = ref({
  value: '',
  label: '',
  opposite: '',
  adjusted: false,
  isConfirmBtnClicked: false,
});

const openModal = (clicked) => {
  visibility.value.isModalVisible = true;
  clickedBtn.value = { value: clicked, label: clicked };
  clickedBtn.value.value = clicked === 'Sender' ? 10 : clicked === 'Receiver' ? 11 : 6;
  clickedBtn.value.opposite = clicked === 'Sender' ? 'Receiver' : clicked === 'Receiver' ? 'Sender' : 'Restore';
  clickedBtn.value.deal_Id = infoProp.value.deal_Id;
  clickedBtn.value.adjusted = false;
  clickedBtn.value.isConfirmBtnClicked = false;
};

const closeModal = (e, val) => {
  if (e) {
    visibility.value.isPwModalVisible = true;
    clickedBtn.value.isConfirmBtnClicked = true;
  }
  if (val.adjusted) {
    visibility.value.isPwModalVisible = false;
    handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  }
  visibility.value.isModalVisible = false;
};

onMounted(() => {
  handleTableChange({ page: 1, results: 10 }, {}, {});
});

watch(props, (val) => {
  if (selectedPageSize.value.value !== 10) {
    selectedPageSize.value = pageSizeOptions.value[0];
  }
  handleTableChange({ page: 1, results: selectedPageSize.value.value }, {}, {});
  clickedBtn.value.adjusted = false;
});
</script>
