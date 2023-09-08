<template>
  <a-space class="q-mb-md" v-if="siteIdx !== SiteGrade.Admin">
    <a-button type="primary" @click="openPromotion(null)">
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

    <template v-slot:body-cell-img="props">
      <q-td :props="props">
        <q-img :src="props.row.img_Url + sasQuery" loading="lazy" spinner-color="white" height="6rem" width="6rem" />
      </q-td>
    </template>
    <template v-slot:body-cell-title="props">
      <q-td :props="props">
        <a-typography-link :ellipsis="true" @click="openPromotion(props.row)" :content="props.row.title" />
      </q-td>
    </template>
    <!-- <template v-slot:body-cell-category="props">
      <q-td :props="props">
        <template v-if="options.promotionCategory.filter((e:any) => e.value === props.row.category).length > 0">
          {{ options.promotionCategory.filter((e: any) => e.value === props.row.category)[0].label() }}
        </template>
        <template v-else>-</template>
      </q-td>
    </template> -->
    <template v-slot:body-cell-isView="props">
      <q-td :props="props">
        <a-badge status="processing" v-if="props.row.isView" />
        <a-badge status="default" v-if="!props.row.isView" />
      </q-td>
    </template>
    <template v-slot:body-cell-isUse="props">
      <q-td :props="props">
        <a-badge status="success" v-if="props.row.isUse" />
        <a-badge status="error" v-if="!props.row.isUse" />
      </q-td>
    </template>
  </q-table>
  <PromotionDetails :show="isPromotion" :data="sendData" @update:show="closePromotion" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import PromotionDetails from 'src/components/modals/PromotionDetails.vue';

import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { extend } from 'quasar';
import { FormOutlined, SearchOutlined } from '@ant-design/icons-vue';
import type { SelectProps } from 'ant-design-vue';
import { onMounted, ref, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, useFilter, dateFormat, options, pages } from 'src/boot/global';
import { SiteGrade, FilterDefault } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());
const { sasQuery } = storeToRefs(commonStore.board());
const { shareSASQuery } = commonStore.board();

const isPromotion = ref<boolean>(false);
const sendData = ref<any>();

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, date: null, text: '' });
const headerStyle = 'padding-left: 3rem';

const columns = ref<any[]>([
  {
    name: 'img',
    field: 'img',
    label: 'table.thead.img',
    align: 'center',
    style: 'width: 8rem',
    sortable: true,
    headerStyle: headerStyle,
  },
  {
    name: 'title',
    field: 'title',
    label: 'table.thead.title',
    align: 'left',
    sortable: true,
  },
  // {
  //   name: 'category',
  //   field: 'category',
  //   label: 'table.thead.category',
  //   align: 'left',
  //   style: 'width: 10%',
  //   sortable: true,
  // },
  {
    name: 'isUse',
    field: 'isUse',
    label: 'table.thead.is_use',
    align: 'center',
    style: 'width: 6%',
    sortable: true,
    headerStyle: headerStyle,
  },
  {
    name: 'isView',
    field: 'isView',
    label: 'table.thead.expose',
    align: 'center',
    style: 'width: 6%',
    sortable: true,
    headerStyle: headerStyle,
  },
  {
    name: 'operator',
    field: 'operator',
    label: 'table.thead.operator',
    align: 'left',
    style: 'width: 10%',
    sortable: true,
  },
  {
    name: 'start_Date',
    field: 'start_Date',
    label: 'table.thead.start_date',
    align: 'left',
    style: 'width: 10%',
    sortable: true,
  },
  {
    name: 'end_Date',
    field: 'end_Date',
    label: 'table.thead.end_date',
    align: 'left',
    style: 'width: 10%',
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
    const response = await apis.manager.PromotionList(send);

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

const openPromotion = (data: any) => {
  isPromotion.value = true;
  sendData.value = data;
};

const closePromotion = (state: boolean) => {
  isPromotion.value = state;
  onRefresh();
  shareSASQuery();
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

onBeforeMount(() => {
  shareSASQuery();
});

onMounted(() => {
  let useOption = siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];
  const custom = [{ value: 2, label: () => t('common.label.title') }];
  searchOption.value = useFilter(useOption, options.filterDefault, custom);
  onRefresh();
});
</script>
