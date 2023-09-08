<template>
  <a-space class="q-mb-md" v-if="siteIdx === SiteGrade.Admin">
    <a-button type="primary" @click="openSolution(null)">
      <template #icon>
        <FormOutlined />
      </template>
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
        <a-typography-link @click="openSolution(props.row)">{{ $t('common.button.edit') }}</a-typography-link>
      </q-td>
    </template>
  </q-table>
  <SolutionDetails :show="isSolution" :data="sendData" @close="closeSolution" />
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';
import SolutionDetails from 'src/components/modals/SolutionDetails.vue';

import { storeToRefs } from 'pinia';
import { FormOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from 'vue';

import { userStore } from 'src/stores/user';
import { SiteGrade } from 'src/components/models/enums';
import { pageOptions, pages } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const { siteIdx } = storeToRefs(userStore.user());

const isSolution = ref<boolean>(false);
const sendData = ref<any>();

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const pagination = ref(pages);

const columns = ref<any[]>([
  {
    name: 'name',
    field: 'name',
    label: 'table.thead.solution_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'api_Key',
    field: 'api_Key',
    label: 'table.thead.api_key',
    align: 'left',
    sortable: true,
  },
  {
    name: 'api_Url',
    field: 'api_Url',
    label: 'table.thead.api_url',
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
  {
    name: 'operation',
    field: 'operation',
    label: 'table.thead.operation',
    align: 'left',
    sortable: true,
  },
]);

const visibleColumns = ref<string[]>([]);

const onRequest = async () => {
  loading.value = true;

  try {
    const response = await apis.manager.SolutionList();

    if (response.data.errCode === 0) {
      rows.value = response.data.returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const openSolution = (data: any) => {
  isSolution.value = true;
  sendData.value = data;
};

const closeSolution = (state: boolean) => {
  isSolution.value = state;
  onRefresh();
};

const onRefresh = () => {
  tableRef.value.requestServerInteraction();
};

onMounted(() => {
  visibleColumns.value =
    siteIdx.value !== SiteGrade.Admin
      ? ['name', 'api_Key', 'api_Url', 'addTime']
      : ['name', 'api_Key', 'api_Url', 'addTime', 'operation'];
  onRefresh();
});
</script>
