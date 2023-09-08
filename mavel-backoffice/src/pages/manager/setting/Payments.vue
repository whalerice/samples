<template>
  <a-space class="q-mb-md">
    <a-button type="primary" @click="openSitePayment(null)">
      <template #icon>
        <FormOutlined />
      </template>
      {{ $t('common.button.register') }}
    </a-button>
  </a-space>
  <!-- <a-card size="small" class="search-area">
    <a-space>
      <a-select v-model:value="searchCategory" label-in-value :options="options.gameCategory"></a-select>
      <a-input-search v-model:value="searchText" placeholder="search" enter-button @search="onSearch" />
    </a-space>
  </a-card> -->

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

    <template v-slot:body-cell-is_Use="props">
      <q-td :props="props">
        <a-tag color="default" v-if="!props.row.is_Use">{{ $t('common.text.unused') }}</a-tag>
        <a-tag color="success" v-if="props.row.is_Use">{{ $t('common.text.use') }}</a-tag>
      </q-td>
    </template>

    <template v-slot:body-cell-operation="props">
      <q-td :props="props">
        <a-typography-link @click="openSitePayment(props.row)">{{ $t('common.button.edit') }}</a-typography-link>
        <!-- <a-button type="primary" ghost size="small" @click="openSitePayment(props.row)">
          {{ $t('common.button.edit') }}
        </a-button> -->
      </q-td>
    </template>
  </q-table>
  <SitePayment :show="isSitePayment" :data="sendData" @close="closeSitePayment" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import SitePayment from 'components/modals/SitePayment.vue';

import { FormOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';

import { pageOptions, pages } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const isSitePayment = ref<boolean>(false);
const sendData = ref<any>();
const rows = ref<any[]>([]);
const loading = ref(false);
const pagination = ref(pages);

const columns = ref<any[]>([
  {
    name: 'is_Use',
    field: 'is_Use',
    required: true,
    label: 'table.thead.is_use',
    align: 'left',
    sortable: true,
  },
  {
    name: 'payment_Name',
    field: 'payment_Name',
    required: true,
    label: 'table.thead.pg_name',
    align: 'left',
    sortable: true,
  },
  // {
  //   name: 'payment_Idx',
  //   field: 'payment_Idx',
  //   required: true,
  //   label: 'table.thead.payment_idx',
  //   align: 'left',
  //   sortable: true,
  // },
  {
    name: 'payment_Code',
    field: 'payment_Code',
    required: true,
    label: 'table.thead.code',
    align: 'left',
    sortable: true,
  },
  {
    name: 'operation',
    field: 'operation',
    required: true,
    label: 'table.thead.operation',
    align: 'left',
    sortable: true,
  },
]);

const onRequest = async () => {
  loading.value = true;

  try {
    const response = await apis.manager.PaymentList();

    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const openSitePayment = (data: any) => {
  isSitePayment.value = true;
  sendData.value = data;
};
const closeSitePayment = (state: boolean) => {
  isSitePayment.value = state;
  onRefresh();
};

const onRefresh = async () => {
  await onRequest();
};

onMounted(() => {
  onRefresh();
});
</script>
