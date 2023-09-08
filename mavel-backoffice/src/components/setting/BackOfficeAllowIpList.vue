<template>
  <a-space>
    <a-typography-title :level="5" class="no-margin">{{ $t('site.drawer.back_office') }}</a-typography-title>
    <a-button type="primary" @click="onSiteAllowIp(null)" v-if="siteIdx === SiteGrade.Admin">
      {{ $t('common.button.register') }}
    </a-button>
  </a-space>
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

    <template v-slot:body-cell-ipAddress="props">
      <q-td :props="props">
        <a-typography-link @click="onSiteAllowIp(props.row)">
          {{ props.row.ipAddress }}
        </a-typography-link>
      </q-td>
    </template>
    <template v-slot:body-cell-isallow="props">
      <q-td :props="props">
        <a-badge status="processing" v-if="props.row.isallow" />
        <a-badge status="default" v-if="!props.row.isallow" />
      </q-td>
    </template>
  </q-table>
  <SiteAllowIp :show="showSiteAllowIp" :data="sendData" @close="closeSiteAllowIp" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import SiteAllowIp from 'src/components/modals/SiteAllowIp.vue';

import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

import { apis } from 'src/stores/apis';
import { pageOptions, pages } from 'src/boot/global';
import { SiteGrade } from 'src/components/models/enums';
import { userStore } from 'src/stores/user';

const props = defineProps({
  idx: {
    type: Number || null,
    required: false,
  },
});

const { siteIdx } = storeToRefs(userStore.user());
const showSiteAllowIp = ref<boolean>(false);
const sendData = ref<any>(null);

const headerStyle = 'padding-left: 3rem';
const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const columns = ref<any[]>([
  {
    name: 'site_Name',
    field: 'site_Name',
    label: 'table.thead.site_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'category',
    field: 'category',
    label: 'table.thead.category',
    align: 'left',
    sortable: true,
  },
  {
    name: 'ipAddress',
    field: 'ipAddress',
    label: 'table.thead.ip',
    align: 'left',
    sortable: true,
  },
  {
    name: 'isallow',
    field: 'isallow',
    label: 'table.thead.is_use',
    align: 'center',
    style: 'width: 1%',
    headerStyle: headerStyle,
    sortable: true,
  },
  {
    name: 'memo',
    field: 'memo',
    label: 'table.thead.memo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
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
    User_Filter: 0,
    Search: '',
  };

  try {
    const response = await apis.manager.BackOfficeAllowIpList(send);

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
const onSiteAllowIp = (data: any) => {
  showSiteAllowIp.value = true;
  if (data === null) sendData.value = { siteIdx: props.idx };
  else sendData.value = { siteIdx: props.idx, ...data };
};

const closeSiteAllowIp = (e: boolean) => {
  showSiteAllowIp.value = e;
  onRefresh();
};

onMounted(() => {
  onRefresh();
});
</script>
