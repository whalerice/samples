<template>
  <a-space class="q-mb-md">
    <a-button type="primary" @click="openNoticeDetail(NoticeStateType.Register)">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.register') }}
    </a-button>
  </a-space>

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

    <template v-slot:body-cell-second_Code="props">
      <q-td :props="props">
        {{ props.row.second_Code === 1 ? $t('common.text.notice') : $t('common.text.faq') }}
      </q-td>
    </template>

    <template v-slot:body-cell-isView="props">
      <q-td :props="props">
        <a-tag color="success" v-if="props.row.isView">ON</a-tag>
        <a-tag color="default" v-if="!props.row.isView">OFF</a-tag>
      </q-td>
    </template>

    <template v-slot:body-cell-title="props">
      <q-td :props="props">
        <a-typography-link @click="openNoticeDetail(NoticeStateType.Modify, props.row)">
          {{ props.row.title }}
        </a-typography-link>
      </q-td>
    </template>
  </q-table>
  <NoticeDetails :show="isNoticeDetails" :data="detailData" @close="closeNoticeDetail" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import NoticeDetails from 'components/modals/NoticeDetails.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { FormOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, useFilter, dateFormat, options, pages } from 'src/boot/global';
import { NoticeStateType, SiteGrade, FilterDefault } from 'src/components/models/enums';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());
const { category } = storeToRefs(commonStore.board());
const { getCategory } = commonStore.board();

const selectCategory = ref<any>({ value: 0, label: '', code: 0, commonIdx: 0 });

const isNoticeDetails = ref<boolean>(false);
const detailData = ref<any>({ idx: 0, commonIdx: 0 });

const tableRef = ref();
const rows = ref<INoticeData[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });

const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });

const columns = ref<any[]>([
  {
    name: 'second_Code',
    field: 'second_Code',
    required: true,
    label: 'table.thead.type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'isView',
    field: 'isView',
    required: true,
    label: 'table.thead.expose',
    align: 'left',
    sortable: true,
  },
  {
    name: 'manager_Id',
    field: 'manager_Id',
    required: true,
    label: 'table.thead.author',
    align: 'left',
    sortable: true,
  },
  {
    name: 'title',
    field: 'title',
    label: 'table.thead.title',
    align: 'left',
    sortable: true,
  },
  // {
  //   name: 'content',
  //   field: 'content',
  //   label: 'table.thead.content',
  //   align: 'left',
  //   sortable: true,
  // },
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
    Code: selectCategory.value.code,
    Second_Code: selectCategory.value.value,
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
    const response = await apis.manager.NoticeList(send);
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

const openNoticeDetail = (type: number, data?: any) => {
  if (type === NoticeStateType.Register) {
    detailData.value.commonIdx = selectCategory.value.commonIdx;
  }

  if (type === NoticeStateType.Modify) {
    detailData.value.idx = data.idx;
    detailData.value.commonIdx = data.common_Idx;
  }

  isNoticeDetails.value = true;
};

const closeNoticeDetail = (state: boolean) => {
  isNoticeDetails.value = state;
  detailData.value.idx = 0;
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

onBeforeMount(async () => {
  await getCategory().then(() => {
    selectCategory.value = category.value[0];
    let useOption =
      siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];

    const custom = [
      { value: 2, label: () => t('common.label.title') },
      { value: 3, label: () => t('common.label.content') },
    ];

    searchOption.value = useFilter(useOption, options.filterDefault, custom);
    onRefresh();
  });
});
</script>
