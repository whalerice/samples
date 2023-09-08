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

    <template v-slot:body-cell-title="props">
      <q-td :props="props">
        <a-typography-link @click="openNoteDetail(props.row)" class="q-mr-sm">
          {{ props.row.title }}
        </a-typography-link>
        <i class="ico-new" v-if="!props.row.is_Read">N</i>
      </q-td>
    </template>

    <template v-slot:body-cell-sender_Role="props">
      <q-td :props="props">
        {{ options.role.filter((e: any) => e.value === props.row.sender_Role)[0].label() }}
      </q-td>
    </template>

    <template v-slot:body-cell-sender_State="props">
      <q-td :props="props">
        {{ options.userStatus.filter((e: any) => e.value === props.row.sender_State)[0].label() }}
      </q-td>
    </template>
  </q-table>

  <NoteDetails :show="isDetail" :data="detailData" @close="closeNoteDetail" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import NoteDetails from 'src/components/modals/NoteDetails.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, useFilter, dateFormat, options, pages } from 'src/boot/global';
import { SiteGrade, FilterDefault } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());

const tableRef = ref();
const rows = ref<INoticeData[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });

const isDetail = ref<boolean>(false);
const detailData = ref<any>();

const columns = ref<any[]>([
  {
    name: 'title',
    field: 'title',
    label: 'table.thead.title',
    align: 'left',
    sortable: true,
  },
  {
    name: 'sender_Id',
    field: 'sender_Id',
    required: true,
    label: 'table.thead.sender',
    align: 'left',
    sortable: true,
  },
  {
    name: 'sender_Role',
    field: 'sender_Role',
    required: true,
    label: 'table.thead.role',
    align: 'left',
    sortable: true,
  },
  {
    name: 'sender_State',
    field: 'sender_State',
    required: true,
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
  },

  {
    name: 'registration_Date',
    field: 'registration_Date',
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
    const response = await apis.manager.MessageList(send);
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

const openNoteDetail = (item: any) => {
  isDetail.value = true;
  detailData.value = item;
};

const closeNoteDetail = (state: boolean) => {
  isDetail.value = state;
  onRefresh();
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
  let useOption =
    siteIdx.value === SiteGrade.Admin
      ? [FilterDefault.All, FilterDefault.SiteName, FilterDefault.IDNick]
      : [FilterDefault.All, FilterDefault.IDNick];

  const custom = [
    { value: 3, label: () => t('common.label.title') },
    { value: 4, label: () => t('common.label.content') },
  ];

  searchOption.value = useFilter(useOption, options.filterDefault, custom);

  onRefresh();
});
</script>
