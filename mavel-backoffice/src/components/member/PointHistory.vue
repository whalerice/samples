<template>
  <q-table
    flat
    ref="tableRef"
    row-key="name"
    no-data-label="noData"
    color="primary"
    binary-state-sort
    v-model:pagination="pagination"
    :rows="rows"
    :rows-per-page-options="pageOptions"
    :columns="columns"
    :loading="loading"
    :rows-per-page-label="$t('common.text.per_page')"
    @update:pagination="(val) => val"
    @request="onRequest">
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ $t(col.label) }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:no-data="{ message }">
      <NoData v-if="message === 'noData'" />
      <TableSkeleton v-else :column="columns.length" />
    </template>

    <template v-slot:body-cell-use_Type="props">
      <q-td :props="props">
        {{ options.useCategory.filter((e: any) => e.value === props.row.use_Type)[0].label() }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { comma, pageOptions, options, pages } from 'src/boot/global';
import { UserType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

// const option = reactive([
//   { value: 1, label: '사이트 이름' }, // site idx 가 있으면 hidden 처리
//   { value: 2, label: '아이디/닉네임' },
// ]);

const route = useRoute();
const { memberType } = storeToRefs(userStore.sign());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
// const searchType = ref(option[0]);
// const searchText = ref<string>('');

const columns = ref<any[]>([
  // {
  //   name: 'user_Id',
  //   field: 'user_Id',
  //   required: true,
  //   label: 'table.thead.user_id',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'use_Type',
    field: 'use_Type',
    required: true,
    label: 'table.thead.use_type',
    align: 'left',
    sortable: true,
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
    name: 'point',
    field: 'point',
    label: 'table.thead.point',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'after_Point',
    field: 'after_Point',
    label: 'table.thead.after_point',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    required: true,
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (props: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  const send = {
    user_Idx: Number(route.params.idx),
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    user_Filter: 0,
    search: '',
  };

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.Pointhistory(send)
        : await apis.partner.Pointhistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;

      rows.value = returnData.list;
      if (returnData.totalCount) total.value = returnData.totalCount.count;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.rowsNumber = total.value;
};

onMounted(() => {
  tableRef.value.requestServerInteraction();
});
</script>
