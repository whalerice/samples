<template>
  <!-- <a-card size="small" class="search-area">
    <a-space>
      <a-select v-model:value="searchCategory" label-in-value :options="options.gameCategory"></a-select>
      <a-input-search v-model:value="searchText" placeholder="search" enter-button @search="onSearch" />
    </a-space>
  </a-card> -->
  <a-space class="q-mb-md">
    <a-button type="primary" @click="openSiteDrawer(null)">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.register') }}
    </a-button>
  </a-space>

  <q-table
    flat
    row-key="name"
    no-data-label="noData"
    color="primary"
    binary-state-sort
    v-model:pagination="pagination"
    :rows="rows"
    :rows-per-page-options="pageOptions"
    :columns="columns"
    :loading="loading"
    :rows-per-page-label="$t('common.text.per_page')">
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

    <template v-slot:body-cell-currency="props">
      <q-td :props="props">
        {{ options.currencyType.filter((e: any) => e.value === props.row.currency)[0].label }}
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <a-typography-link @click="openSiteDrawer(props.row.idx)">
          {{ props.row.name }}
        </a-typography-link>
      </q-td>
    </template>

    <template v-slot:body-cell-status="props">
      <q-td :props="props">
        {{ options.userStatus.filter((e: any) => e.value === props.row.status)[0].label() }}
      </q-td>
    </template>
  </q-table>
  <SiteDrawer :show="isSiteDrawer" :idx="sendIdx" @close="closeSiteDrawer" v-if="isSiteDrawer" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import SiteDrawer from 'src/components/SiteDrawer.vue';

import { FormOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';

import { pageOptions, options, comma, pages } from 'src/boot/global';
import { commonStore } from 'src/stores/common';
import { apis } from 'src/stores/apis';

const { getSolution } = commonStore.board();

const isSiteDrawer = ref<boolean>(false);
const sendIdx = ref<any>(null);

const rows = ref<any[]>([]);
const loading = ref(false);
const pagination = ref(pages);
// const searchCategory = ref(options.gameCategory[0]);
// const searchText = ref<string>('');

const columns = ref<any[]>([
  {
    name: 'solution_Name',
    field: 'solution_Name',
    label: 'table.thead.solution_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'name',
    field: 'name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'currency',
    field: 'currency',
    label: 'table.thead.currency_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'exchange_Losing',
    field: 'exchange_Losing',
    label: 'table.thead.losing',
    align: 'right',
    format: (e: number) => `${comma(e)}%`,
    sortable: true,
  },
  {
    name: 'exchange_Rolling',
    field: 'exchange_Rolling',
    label: 'table.thead.rolling',
    align: 'right',
    format: (e: number) => `${comma(e)}%`,
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
    name: 'addTime',
    field: 'addTime',
    label: 'table.thead.registration_date',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async () => {
  loading.value = true;

  try {
    const response = await apis.manager.SiteList();

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const openSiteDrawer = (idx: any) => {
  sendIdx.value = idx;
  isSiteDrawer.value = true;
};

const closeSiteDrawer = (state: boolean) => {
  setTimeout(() => {
    isSiteDrawer.value = state;
  }, 300);
};

const onRefresh = async () => {
  await onRequest();
};

// const onSearch = () => {
//   onRefresh();
// };

onMounted(() => {
  getSolution();
  onRefresh();
});
</script>
