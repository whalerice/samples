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
        {{ $t($props.title) }}
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
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <a-typography-paragraph :ellipsis="true" :content="props.row.title" />
        </q-td>
      </template>
      <template v-slot:body-cell-content="props">
        <q-td :props="props">
          <a-typography-link underline :ellipsis="true" :content="props.row.content" @click="showDetails(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <a-space :size="5" class="q-ml-md col-auto">
            <q-btn unelevated color="red">삭제</q-btn>
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
  <NoteDetails :show="isDetail" :data="detailData" @close="closeDetailModal" />
</template>

<script setup lang="ts">
import TableSkeleton from 'components/TableSkeleton.vue';
import NoteDetails from 'src/components/modals/NoteDetails.vue';

import { Empty } from 'ant-design-vue';
import { computed, onMounted, onUpdated, ref } from 'vue';

const isDetail = ref<boolean>(false);
const detailData = ref<object>({});

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
    name: 'title',
    field: 'title',
    label: '제목',
    align: 'left',
    required: true,
    sortable: true,
  },
  {
    name: 'content',
    field: 'content',
    label: '내용',
    align: 'left',
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
  //       time: '2023-01-19T09:13:47.169Z',
  //       id: 'ekdlsekridh',
  //       nick: '포테이토',
  //       title: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.',
  //       content:
  //         'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nesciunt, neque modi nobis provident libero aperiam animi reiciendis porro quod, dolorum harum non placeat autem aliquid soluta? Voluptate odio magnam repudiandae.',
  //     },
  //   ];
  //   loading.value = false;
  // }, 2000);
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

const showDetails = (data: object) => {
  isDetail.value = true;
  detailData.value = data;
};

const closeDetailModal = (e: boolean) => {
  isDetail.value = e;
};

onUpdated(() => {
  // console.log(visible.value);
  // console.log(tableRef.value);
  // if (visible.value && tableRef.value) {
  //   onRefresh();
  // }
});

onMounted(() => {
  onRefresh();
});
</script>
