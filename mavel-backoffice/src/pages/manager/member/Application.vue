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
      <a-button type="primary" @click="createAffiliateModal(true)">
        {{ $t('modal.title.affiliate_register') }}
      </a-button>
    </a-col>
    <a-col span="12" class="text-right"> </a-col>
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
        <UserBtn :idx="props.row.userIdx" :id="props.row.user_Id" :status="props.row.status" />
      </q-td>
    </template>

    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        <template v-if="options.userStatus.filter((e:any) => e.value === props.row.status).length > 0">
          <template v-if="props.row.status === UserStatus.StandBy">
            <a-button type="primary" ghost size="small" @click="onApproval(props.row, true)">
              {{ $t('common.text.approval') }}
            </a-button>

            <a-button type="primary" ghost size="small" danger @click="onApproval(props.row, false)">
              {{ $t('common.text.refusal') }}
            </a-button>
          </template>
          <template v-else>
            {{ options.userStatus.filter((e: any) => e.value === props.row.status)[0].label() }}
          </template>
        </template>
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
    <template v-slot:body-cell-rewardType="props">
      <q-td :props="props">
        <span
          v-if="
            props.row.status !== UserStatus.StandBy &&
            options.rewardType.filter((e:any) => e.value === props.row.rewardType).length > 0
          ">
          {{ options.rewardType.filter((e: any) => e.value === props.row.rewardType)[0].label() }}
        </span>
        <a-select
          v-model:value="props.row.rewardType"
          v-if="props.row.status === UserStatus.StandBy"
          :placeholder="$t('common.placeholder.select')"
          :options="options.rewardType" />
      </q-td>
    </template>
  </q-table>
  <CreateAffiliate :show="isCreateAffiliate" @update:show="createAffiliateModal" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import UserBtn from 'src/components/UserBtn.vue';
import CreateAffiliate from 'components/modals/CreateAffiliate.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { message, SelectProps } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';

import { pageOptions, options, dateFormat, useFilter, pages } from 'src/boot/global';
import { UserStatus, FilterDefault, SiteGrade } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { siteIdx } = storeToRefs(userStore.user());
const { t } = useI18n();

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const isCreateAffiliate = ref<boolean>(false);

const columns = ref<any[]>([
  {
    name: 'site_Name',
    field: 'site_Name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
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
    name: 'email',
    field: 'email',
    required: true,
    label: 'table.thead.email',
    align: 'left',
    sortable: true,
  },
  // {
  //   name: 'referral_Id',
  //   field: 'referral_Id',
  //   label: 'table.thead.referral_id',
  //   align: 'left',
  //   sortable: true,
  // },
  // {
  //   name: 'role',
  //   field: 'role',
  //   label: 'table.thead.role',
  //   align: 'left',
  //   sortable: true,
  // },
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
    name: 'approver',
    field: 'approver',
    label: 'table.thead.approver',
    align: 'left',
    sortable: true,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    label: 'table.thead.registration_date',
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
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.AffiliateList(send);

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

const onApproval = async (data: any, state: boolean) => {
  const send: IAffiliate = { idx: data.no, rewardType: data.rewardType, isApproval: state };

  try {
    const response = await apis.manager.AffiliateApproval(send);

    if (response.data.errCode === 0) {
      message.success(response.data.errMessage);
      onRefresh();
    }
  } catch (error: any) {
    if (error.response.data.status === 400) {
      message.error('정산방법을 선택해주세요');
    }
  }
};

const onSearch = () => {
  onRefresh();
};

const onRefresh = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  tableRef.value.requestServerInteraction();
};

const createAffiliateModal = (value: boolean) => {
  isCreateAffiliate.value = value;
  if (!value) onRefresh();
};

onMounted(() => {
  let useOption =
    siteIdx.value === SiteGrade.Admin
      ? [FilterDefault.All, FilterDefault.SiteName, FilterDefault.IDNick]
      : [FilterDefault.All, FilterDefault.IDNick];

  const custom = [
    { value: 3, label: () => t('common.label.email') },
    { value: 4, label: () => t('common.label.approver') },
  ];
  searchOption.value = useFilter(useOption, options.filterDefault, custom);

  onRefresh();
});
</script>
