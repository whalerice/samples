<template>
  <div class="text-h3 fw-700 mb-30">
    {{ $t('nav.notice') }}
  </div>
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
    color="primary"
    @request="onRequest">
    <!-- <template v-slot:top-left>
      <span>{{ $t(tableTitle) }}</span>
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
    </template> -->
    <template v-slot:top-right>
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
      <q-btn flat dense round :icon="isMobile === true ? 'list' : 'grid_view'" @click="isMobile = !isMobile" />
    </template>
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:item="props">
      <div
        class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        :style="props.selected ? 'transform: scale(0.95);' : ''">
        <q-card
          :class="props.selected ? 'bg-grey-2' : ''"
          flat
          bordered
          class="table-card"
          @click="showNoticeDetail(props.row)">
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

    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center">
        <span> {{ message }} </span>
      </div>
    </template>

    <template v-slot:body-cell-title="props">
      <q-td :props="props">
        <span class="text-link" @click="showNoticeDetail(props.row)">{{ props.row.title }}</span>
        <!-- <q-badge color="red" rounded v-if="!props.row.isView" /> -->
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Platform } from 'quasar';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { apis } from 'src/stores/apis';

const router = useRouter();
// const emits = defineEmits(['state']);

const isMobile = ref(Platform.is.mobile === undefined ? false : true);

const tableRef = ref();
const rows = ref<any[]>([]);
const filter = ref('');
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({
  sortBy: '',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
});

const headerStyle = 'padding-left: 3.8rem';

const columns = ref<any[]>([
  {
    name: 'idx',
    field: 'idx',
    label: 'table.thead.no',
    align: 'center',
    sortable: true,
    style: 'width: 6%',
    headerStyle: headerStyle,
  },
  {
    name: 'title',
    field: 'title',
    label: 'table.thead.title',
    align: 'left',
    sortable: true,
  },
  {
    name: 'manager_Id',
    field: 'manager_Id',
    label: 'table.thead.writer',
    align: 'center',
    sortable: true,
    style: 'width: 10%',
    headerStyle: headerStyle,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    label: 'table.thead.registration_date',
    align: 'center',
    sortable: true,
    style: 'width: 10%',
    headerStyle: headerStyle,
  },
  {
    name: 'views',
    field: 'views',
    label: 'table.thead.views',
    align: 'center',
    sortable: true,
    style: 'width: 6%',
    headerStyle: headerStyle,
  },
]);
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;

  loading.value = true;
  const send = {
    code: 200,
    second_Code: 1,
    user_Filter: 0,
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    search: '',
  };

  //   공지사항 : code = 200 AND second_Code = 1
  // FAQ : code = 200 AND second_Code = 2

  try {
    const response = await apis.NoticeList(send);
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

const showNoticeDetail = (data: any) => {
  router.push({ name: 'NoticeDetails', params: { idx: data.idx } });
  // emits('state', data, false);
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  onRefresh();
  // window.scrollTo(0, 0);
});
</script>

<!-- <template>
  <div class="text-h3 fw-700 mb-30">
    {{ $t('nav.notice') }}
  </div>

  <NoticeList v-if="isList" @state="change" />
  <NoticeDetails v-if="!isList" :data="noticeData" @state="change" />
</template>

<script setup lang="ts">
import NoticeList from 'components/NoticeList.vue';
import NoticeDetails from 'components/NoticeDetails.vue';

import { ref } from 'vue';

const noticeData = ref<any>(null);
const isList = ref<boolean>(true);

const change = (data: any, state: boolean) => {
  isList.value = state;
  noticeData.value = data;
};
</script> -->
