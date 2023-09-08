<template>
  <a-space class="q-mb-md">
    <a-button type="primary" @click="isCreateBlock = true">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.create_block') }}
    </a-button>
  </a-space>

  <a-card size="small" class="search-area">
    <a-space>
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
  <div class="text-right q-mb-sm">
    <ExcelDownload :data="searchSendData" url="ProductList" />
  </div>
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

    <template v-slot:body-cell-block_Type="props">
      <q-td :props="props">
        {{ options.blockType.filter((e: any) => e.value === props.row.block_Type)[0].label() }}
      </q-td>
    </template>

    <template v-slot:body-cell-block_State="props">
      <q-td :props="props">
        {{ options.blockState.filter((e: any) => e.value === props.row.block_State)[0].label() }}
      </q-td>
    </template>
  </q-table>
  <CreateBlock :show="isCreateBlock" @close="closeCreateBlock" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import CreateBlock from 'components/modals/CreateBlock.vue';
import ExcelDownload from 'src/components/ExcelDownload.vue';

import { extend } from 'quasar';
import { storeToRefs } from 'pinia';
import { SelectProps } from 'ant-design-vue';
import { FormOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';

import { pageOptions, options, useFilter, pages } from 'src/boot/global';
import { apis } from 'src/stores/apis';
import { FilterDefault, SiteGrade } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';

const { siteIdx } = storeToRefs(userStore.user());

const isCreateBlock = ref<boolean>(false);
const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);

const search = ref<ISearch>({ type: FilterDefault.All, text: '' });
const searchSendData = ref<ISearch>({ type: FilterDefault.All, text: '' });

const columns = ref<any[]>([
  {
    name: 'site_Name',
    field: 'site_Name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_Type',
    field: 'block_Type',
    required: true,
    label: 'table.thead.block_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_Words',
    field: 'block_Words',
    required: true,
    label: 'table.thead.block_words',
    align: 'left',
    sortable: true,
  },
  {
    name: 'memo',
    field: 'memo',
    required: true,
    label: 'table.thead.memo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'block_State',
    field: 'block_State',
    required: true,
    label: 'table.thead.status',
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

  searchSendData.value.order = sortBy;
  searchSendData.value.sort = descending ? 'desc' : 'asc';

  const send = {
    currentPage: page,
    currentPageSize: rowsPerPage,
    order: sortBy,
    sort: descending ? 'desc' : 'asc',
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.BlockList(send);

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

const closeCreateBlock = (e: boolean) => {
  isCreateBlock.value = e;
  onRefresh();
};

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  let useOption = siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];

  searchOption.value = useFilter(useOption, options.filterDefault);
  onRefresh();
});
</script>
