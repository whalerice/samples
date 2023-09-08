<template>
  <div class="text-h3 fw-700 mb-30">
    {{ $t('nav.faq') }}
  </div>
  <q-table
    flat
    ref="tableRef"
    row-key="idx"
    :no-data-label="$t('table.message.no_data')"
    :rows="rows"
    :rows-per-page-options="[10, 15, 20, 25, 30]"
    :columns="columns"
    :loading="loading"
    :filter="filter"
    hide-header
    binary-state-sort
    v-model:pagination="pagination"
    color="primary"
    class="faq"
    @request="onRequest">
    <!-- <template v-slot:header="props">
      <q-tr :props="props">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template> -->

    <template v-slot:top-right>
      <q-btn flat dense round icon="refresh" :class="{ 'fa-spin': loading }" @click="onRefresh" />
    </template>

    <template v-slot:body="props">
      <q-list bordered class="rounded-borders">
        <q-expansion-item class="no-padding" icon="o_info" :label="$t(props.row.title)">
          <q-card>
            <q-card-section class="column">
              {{ props.row.content }}
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apis } from 'src/stores/apis';

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
    name: 'title',
    field: 'title',
    label: 'table.thead.title',
    align: 'left',
    // sortable: true,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    label: 'table.thead.registration_date',
    align: 'center',
    // sortable: true,
    style: 'width: 10%',
    headerStyle: headerStyle,
  },
]);
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;

  loading.value = true;
  const send = {
    code: 200,
    second_Code: 2,
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

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  onRefresh();
});
</script>
