<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    :class="{ 'table-bottom-center': isMobile }"
    :no-data-label="$t('table.message.no_data')"
    :rows="rows"
    :rows-per-page-options="[5, 10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    :grid="isMobile"
    binary-state-sort
    v-model:pagination="pagination"
    @request="onRequest">
    <!-- <template v-slot:top-left>
      <span>{{ $t(tableTitle) }}</span>
    </template> -->
    <template v-slot:top-right>
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>
    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''">
        <q-card :class="props.selected ? 'bg-grey-2' : ''" flat bordered class="table-card">
          <q-list dense class="table-card-list">
            <q-item v-for="col in props.cols.filter((col:any) => col.name !== 'desc')" :key="col.name">
              <q-item-section>
                <q-item-label class="title">{{ $t(col.label) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="value">{{ col.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </template>

    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center">
        <span> {{ message }} </span>
      </div>
    </template>
    <template v-slot:body-cell-use_Type="props">
      <q-td :props="props">
        {{ $t(useType.filter((e) => e.key === props.row.use_Type)[0].label) }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { ref, onMounted } from 'vue';
import { apis } from 'src/stores/apis';
import { commonStore } from 'src/stores/common';
// import { commonStore } from 'src/stores/common';

// const { comma, csvFile } = commonStore.common();
const { comma } = commonStore.common();

const useType = [
  { key: 1, label: 'common.text.cash_switching' }, // 캐시 전환 ( - )
  { key: 2, label: 'common.text.event_gain' }, // 이벤트 획득 ( + )
  { key: 3, label: 'common.text.admin_deduct' }, // 관리자 차감 ( - )
  { key: 4, label: 'common.text.admin_provide' }, // 관리자 지급 ( + )
];

const columns = ref<any[]>([
  {
    name: 'use_Type',
    field: 'use_Type',
    required: true,
    label: 'table.thead.point_status',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },

  {
    name: 'point',
    field: 'point',
    required: true,
    label: 'table.thead.point',
    align: 'right',
    sortable: true,
    format: (val: number) => comma(val),
    style: 'width: 15%',
  },
  {
    name: 'after_Point',
    field: 'after_Point',
    required: true,
    label: 'table.thead.after_point',
    align: 'right',
    sortable: true,
    format: (val: number) => comma(val),
    style: 'width: 15%',
  },
  {
    name: 'use_Detail',
    field: 'use_Detail',
    required: true,
    label: 'table.thead.content',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    required: true,
    label: 'table.thead.time',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
  },
]);

// const tableTitle = ref('tab.title.point_history');
const tableRef = ref();
const rows = ref<any[]>([]);
const filter = ref('');
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});
const isMobile = ref(Platform.is.mobile === undefined ? false : true);

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;

  loading.value = true;

  const send = {
    CurrentPage: page,
    CurrentPageSize: rowsPerPage,
    Order: sortBy,
    Sort: descending ? 'desc' : 'asc',
    Req_BeforeDate: '',
    Req_AfterDate: '',
  };

  try {
    const response = await apis.PointHistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;

      rows.value = returnData.list;

      if (returnData.totalCount) {
        total.value = returnData.totalCount.count;
      }
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsNumber = total.value;
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  tableRef.value.requestServerInteraction();
});
</script>

<style scoped></style>
