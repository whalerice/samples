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

    <template v-slot:body-cell-state="props">
      <q-td :props="props">
        <a-space :size="4" v-if="props.row.state === UserCalculateState.Request">
          <a-button type="primary" size="small" @click="onStatus(props.row, true)">
            {{ $t('common.button.approval') }}
          </a-button>
          <a-button type="primary" size="small" danger @click="onStatus(props.row, false)">
            {{ $t('common.button.refusal') }}
          </a-button>
        </a-space>
        <template v-else>
          {{
            props.row.state === UserCalculateState.Completion ? $t('common.text.completion') : $t('common.text.refusal')
          }}
        </template>
      </q-td>
    </template>

    <template v-slot:body-cell-reward_Type="props">
      <q-td :props="props">
        {{ options.rewardType.filter((e: any) => e.value === props.row.reward_Type)[0].label() }}
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { apis } from 'src/stores/apis';
import { comma, pageOptions, options, pages } from 'src/boot/global';
import { UserCalculateState, UserType } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { useRoute } from 'vue-router';

const route = useRoute();
const { memberType } = storeToRefs(userStore.sign());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const columns = ref<any[]>([
  // {
  //   name: 'user_Id',
  //   field: 'user_Id',
  //   label: 'table.thead.user_id',
  //   align: 'left',
  //   sortable: true,
  // },
  // {
  //   name: 'belong',
  //   field: 'belong',
  //   label: 'table.thead.belong',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'reward_Type',
    field: 'reward_Type',
    label: 'table.thead.reward_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.request_time',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    field: 'amount',
    label: 'table.thead.application_amount',
    align: 'right',
    format: (e: number) => comma(e),
    sortable: true,
  },
  {
    name: 'state',
    field: 'state',
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
  },
  {
    name: 'processing_Date',
    field: 'processing_Date',
    label: 'table.thead.processing_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (t: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = t.pagination;

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: '',
    req_AfterDate: '',
    user_Idx: Number(route.params.idx),
  };

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.UserCalculateHistory(send)
        : await apis.partner.UserCalculateHistory(send);

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData.list;

      if (returnData.totalCount) total.value = returnData.totalCount.count;
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

const onStatus = async (data: any, state: boolean) => {
  const stateType = { Approval: 2, Refusal: 3 }; //승인 = 2, 거절 = 3

  const send = {
    idx: data.idx,
    referral_Id: data.referral_Id,
    referral_Idx: Number(data.referral_Idx),
    state: state ? stateType.Approval : stateType.Refusal,
    amount: data.amount,
    admin_User_Idx: 0,
  };

  try {
    const response =
      memberType.value === UserType.Manager
        ? await apis.manager.UserCalculateSetting(send)
        : await apis.partner.UserCalculateSetting(send);
    if (response.data.errCode === 0) {
      onRefresh();
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  onRefresh();
});
</script>
