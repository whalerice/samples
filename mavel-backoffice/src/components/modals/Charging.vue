<template>
  <a-modal
    width="100rem"
    v-model:visible="visible"
    :footer="null"
    :destroyOnClose="true"
    :forceRender="true"
    color="primary"
    :bodyStyle="{ padding: 0 }">
    <template #title>
      <span class="title q-mr-xs">
        {{ $t(props.title) }}
      </span>
      <q-btn flat unelevated round color="primary" icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
    </template>

    <q-table
      flat
      ref="tableRef"
      row-key="time"
      color="primary"
      no-data-label="noData"
      v-model:pagination="pagination"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :rows-per-page-label="$t('common.text.per_page')"
      @request="onRequest">
      <template v-slot:body-cell-amount="props">
        <q-td :props="props">
          {{ comma(props.row.amount) }}
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <a-space :size="5" class="q-ml-md col-auto">
            <q-btn unelevated color="primary">확인</q-btn>
            <q-btn unelevated color="red">취소</q-btn>
          </a-space>
        </q-td>
      </template>
      <template v-slot:no-data="{ message }">
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" class="no-data" v-if="message === 'noData'">
          <template #description> {{ $t('table.message.no_data') }} </template>
        </a-empty>
        <TableSkeleton v-else :column="columns.length" :row="2" />
      </template>
    </q-table>
  </a-modal>
</template>

<script setup lang="ts">
import TableSkeleton from 'components/TableSkeleton.vue';

import { Empty } from 'ant-design-vue';
import { computed, onMounted, onUpdated, ref } from 'vue';
import { comma } from 'src/boot/global';

// const visible = ref<boolean>(true);

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value);
  },
});

const emits = defineEmits(['close']);

const pagination = ref({
  sortBy: '',
  descending: true,
  page: 1,
  rowsPerPage: 5, // Records per page :  페이지당 보여줄 레코드 수
});

const tableRef = ref();
const loading = ref<boolean>(false);

const columns: any = [
  {
    name: 'time',
    field: 'time',
    label: '신청시간',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'id',
    field: 'id',
    label: '아이디',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'nick',
    field: 'nick',
    label: '닉네임',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'bank',
    field: 'bank',
    label: '입금은행',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'name',
    field: 'name',
    label: '이름',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'amount',
    field: 'amount',
    label: '신청금액',
    align: 'right',
    required: true,
    sortable: true,
  },

  {
    name: 'action',
    field: 'action',
    label: '',
    align: 'center',
    required: false,
    sortable: false,
  },
];

const rows = ref<any[]>([]);

const onRequest = (props: any) => {
  // console.log(props);
  // loading.value = true;
  // setTimeout(() => {
  //   rows.value = [
  //     {
  //       time: '2022-10-11 20:18',
  //       id: 'dteisldflej',
  //       nick: '마마',
  //       name: '김지훈',
  //       bank: '농협',
  //       amount: 100000,
  //     },
  //     {
  //       time: '2022-10-11 20:19',
  //       id: 'embasneirj',
  //       nick: '랄라블라허허허허',
  //       name: '코인',
  //       bank: '수협',
  //       amount: 200000,
  //     },
  //   ];
  //   loading.value = false;
  // }, 1000);
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onUpdated(() => {
  if (visible.value && tableRef.value) {
    onRefresh();
  }
});

onMounted(() => {
  onRefresh();
});
</script>
