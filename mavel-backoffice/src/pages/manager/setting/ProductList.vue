<template>
  <a-space class="q-mb-md" v-if="siteIdx !== SiteGrade.Admin">
    <a-button type="primary" @click="openProduct(null)">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.register') }}
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
    :visible-columns="visibleColumns"
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

    <template v-slot:body-cell-operation="props">
      <q-td :props="props">
        <a-typography-link @click="openProduct(props.row)">{{ $t('common.button.edit') }}</a-typography-link>
      </q-td>
    </template>

    <template v-slot:body-cell-productName="props">
      <q-td :props="props">
        <span class="q-mr-sm">{{ props.row.productName }}</span>
        <a-badge status="processing" v-if="props.row.isUse" />
      </q-td>
    </template>
  </q-table>
  <ProductDetails :show="isProduct" :data="sendData" @close="closeProduct" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import ProductDetails from 'src/components/modals/ProductDetails.vue';
import ExcelDownload from 'src/components/ExcelDownload.vue';

import { extend } from 'quasar';
import { SearchOutlined, FormOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { comma, pageOptions, useFilter, options, pages } from 'src/boot/global';
import { SiteGrade, FilterDefault } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());

const isProduct = ref<boolean>(false);
const sendData = ref<any>();

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
    name: 'operator',
    field: 'operator',
    label: 'table.thead.operator',
    align: 'left',
    sortable: true,
  },
  {
    name: 'siteName',
    field: 'siteName',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'productName',
    field: 'productName',
    label: 'table.thead.product_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'price',
    field: 'price',
    label: 'table.thead.price',
    align: 'right',
    format: (val: number) => comma(val),
    sortable: true,
  },
  {
    name: 'descount',
    field: 'descount',
    label: 'table.thead.discount',
    align: 'right',
    format: (val: number) => `${comma(val)}%`,
    sortable: true,
  },
  {
    name: 'registration_Date',
    field: 'registration_Date',
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'operation',
    field: 'operation',
    label: 'table.thead.operation',
    align: 'left',
    sortable: true,
  },
]);

const visibleColumns = ref<string[]>([]);

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
    const response = await apis.manager.ProductList(send);

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

const openProduct = (data: any) => {
  isProduct.value = true;
  sendData.value = data;
};

const closeProduct = (state: boolean) => {
  isProduct.value = state;
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
  visibleColumns.value =
    siteIdx.value !== SiteGrade.Admin
      ? ['operator', 'productName', 'price', 'descount', 'registration_Date', 'operation']
      : ['operator', 'siteName', 'productName', 'price', 'descount', 'registration_Date'];

  let useOption = siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];

  const custom = [
    { value: 2, label: () => t('common.label.price') },
    // { value: 3, label: () => t('common.label.use_status') },
  ];

  searchOption.value = useFilter(useOption, options.filterDefault, custom);

  onRefresh();
});
</script>
