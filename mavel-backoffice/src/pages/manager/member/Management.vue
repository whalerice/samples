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

  <a-row :gutter="[8, 8]" class="q-mb-sm">
    <a-col span="12">
      <a-space>
        <a-button type="primary" @click="createAffiliateModal(true)">
          {{ $t('modal.title.affiliate_register') }}
        </a-button>
        <a-button type="primary" ghost @click="createUserModal(true)">
          {{ $t('modal.title.user_register') }}
        </a-button>
      </a-space>
    </a-col>
    <a-col span="12" class="text-right">
      <ExcelDownload :data="searchSendData" url="UserInfoList" />
    </a-col>
  </a-row>

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
    <template v-slot:body-cell-role="props">
      <q-td :props="props">
        <span v-if="options.role.filter((e:any) => e.value === props.row.role).length > 0">
          {{ options.role.filter((e: any) => e.value === props.row.role)[0].label() }}
        </span>
        <span v-else>-</span>
      </q-td>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        {{ options.userStatus.filter((e: any) => e.value === props.row.status)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-rewardType="props">
      <q-td :props="props">
        <template v-if="props.row.rewardType">
          {{ options.rewardType.filter((e: any) => e.value === props.row.rewardType)[0].label() }}
        </template>
        <template v-else>-</template>
      </q-td>
    </template>
    <template v-slot:body-cell-referral_Id="props">
      <q-td :props="props">
        <a-tooltip placement="top" :title="props.row.belong" trigger="click">
          <a-button size="small">{{ props.row.referral_Id }}</a-button>
        </a-tooltip>
      </q-td>
    </template>
  </q-table>
  <CreateAffiliate :show="isCreateAffiliate" @update:show="createAffiliateModal" />
  <CreateUser :show="isCreateUser" @update:show="createUserModal" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import UserBtn from 'components/UserBtn.vue';
import ExcelDownload from 'components/ExcelDownload.vue';
import CreateAffiliate from 'components/modals/CreateAffiliate.vue';
import CreateUser from 'components/modals/CreateUser.vue';

// csvFile,
import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons-vue';
import type { SelectProps } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { comma, pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { FilterDefault, SiteGrade } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { siteIdx } = storeToRefs(userStore.user());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const isCreateAffiliate = ref<boolean>(false);
const isCreateUser = ref<boolean>(false);

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
    name: 'nick',
    field: 'nick',
    label: 'table.thead.nick',
    align: 'left',
    sortable: true,
  },
  {
    name: 'role',
    field: 'role',
    label: 'table.thead.role',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cash',
    field: 'cash',
    label: 'table.thead.cash',
    align: 'right',
    format: (val: number) => comma(val),
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
    name: 'rolling',
    field: 'rolling',
    label: 'table.thead.rolling',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'losing',
    field: 'losing',
    label: 'table.thead.losing',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'sum_Charge',
    field: 'sum_Charge',
    label: 'table.thead.sum_charge',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'sum_Exchange',
    field: 'sum_Exchange',
    label: 'table.thead.sum_exchange',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'rewardType',
    field: 'rewardType',
    label: 'table.thead.reward_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    field: 'status',
    label: 'table.thead.status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'referral_Id',
    field: 'referral_Id',
    label: 'table.thead.referral_id',
    align: 'left',
    sortable: true,
  },
  // {
  //   name: 'belong',
  //   field: 'belong',
  //   label: 'table.thead.belong',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async (props: any) => {
  loading.value = true;

  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  searchSendData.value.order = sortBy;
  searchSendData.value.sort = descending ? 'desc' : 'asc';

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    req_BeforeDate: searchSendData.value.date ? dayjs(searchSendData.value.date[0]).format(dateFormat) : '',
    req_AfterDate: searchSendData.value.date ? dayjs(searchSendData.value.date[1]).format(dateFormat) : '',
    company_Idx: 0,
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.UserInfoList(send);

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

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

const createAffiliateModal = (value: boolean) => {
  isCreateAffiliate.value = value;
  if (!value) onRefresh();
};
const createUserModal = (value: boolean) => {
  isCreateUser.value = value;
  if (!value) onRefresh();
};

onMounted(() => {
  let useOption =
    siteIdx.value === SiteGrade.Admin
      ? [FilterDefault.All, FilterDefault.SiteName, FilterDefault.IDNick, FilterDefault.RecommendID]
      : [FilterDefault.All, FilterDefault.IDNick, FilterDefault.RecommendID];

  searchOption.value = useFilter(useOption, options.filterDefault);

  onRefresh();
});
</script>
