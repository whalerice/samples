<template>
  <a-card size="small" class="search-area">
    <a-space>
      <a-range-picker v-model:value="search.date" :format="dateFormat" />
      <a-input-group compact>
        <a-select v-model:value="search.type" :options="searchOption" />
        <a-input v-model:value="search.text" :placeholder="$t('common.placeholder.search')" @pressEnter="onSearch" />
      </a-input-group>
      <a-button type="primary" @click="onSearch">
        <template #icon><SearchOutlined /></template>
        {{ $t('common.button.search') }}
      </a-button>
    </a-space>
  </a-card>

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

    <template v-slot:body-cell-user_Id="props">
      <q-td :props="props">
        <UserBtn :idx="props.row.idx" :id="props.row.user_Id" :type="props.row.rewardType" :status="props.row.status" />
      </q-td>
    </template>

    <template v-slot:body-cell-belong="props">
      <q-td :props="props">
        <a-tooltip placement="top" :title="props.row.belong" trigger="click">
          <a-button size="small">{{ props.row.referral_Id }}</a-button>
        </a-tooltip>
      </q-td>
    </template>

    <template v-slot:body-cell-reward_Type="props">
      <q-td :props="props">
        {{ options.rewardType.filter((e: any) => e.value === props.row.reward_Type)[0].label() }}
      </q-td>
    </template>

    <template v-slot:body-cell-state="props">
      <q-td :props="props">
        <a-space :size="4" v-if="props.row.state === UserCalculateState.Request">
          <a-button type="primary" ghost size="small" @click="onStatus(props.row, true)">
            {{ $t('common.button.approval') }}
          </a-button>
          <a-button type="primary" ghost size="small" danger @click="onStatus(props.row, false)">
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
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import UserBtn from 'src/components/UserBtn.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';

import { comma, pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { FilterDefault, RewardType, UserCalculateState } from 'src/components/models/enums';
import { apis } from 'src/stores/apis';

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });

const columns = ref<any[]>([
  {
    name: 'user_Id',
    field: 'user_Id',
    required: true,
    label: 'table.thead.user_id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'reward_Type',
    field: 'reward_Type',
    required: true,
    label: 'table.thead.reward_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    field: 'amount',
    label: 'table.thead.application_amount',
    align: 'right',
    format: (val: number) => comma(val),
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
    name: 'belong',
    field: 'belong',
    required: true,
    label: 'table.thead.belong',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
    required: true,
    label: 'table.thead.request_time',
    align: 'left',
    sortable: true,
  },
  {
    name: 'processing_Date',
    field: 'processing_Date',
    required: true,
    label: 'table.thead.processing_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (props: any) => {
  loading.value = true;
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: searchSendData.value.date ? dayjs(searchSendData.value.date[0]).format(dateFormat) : '',
    req_AfterDate: searchSendData.value.date ? dayjs(searchSendData.value.date[1]).format(dateFormat) : '',
    reward_Type: RewardType.Losing,
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };
  try {
    const response = await apis.partner.CalculateHistory(send);
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

const onStatus = async (data: any, state: boolean) => {
  loading.value = true;
  const stateType = { Approval: 2, Refusal: 3 };

  const send = {
    idx: data.idx,
    referral_Id: data.referral_Id,
    referral_Idx: data.referral_Idx,
    state: state ? stateType.Approval : stateType.Refusal,
    amount: data.amount,
  };

  try {
    const response = await apis.partner.UserCalculateSetting(send);
    if (response.data.errCode === 0) {
      onRefresh();
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

onMounted(() => {
  let useOption = [FilterDefault.All, FilterDefault.IDNick, FilterDefault.RecommendID];

  searchOption.value = useFilter(useOption, options.filterDefault);
  onRefresh();
});
</script>
