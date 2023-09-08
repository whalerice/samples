<template>
  <a-card size="small" class="search-area">
    <a-space>
      <a-select v-model:value="search.category" :options="options.gameCategory"></a-select>
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
        <a-image :width="80" :src="props.row.imgUrl === '' ? '/img/no_img.png' : props.row.img" />
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        {{ props.row.name_Ko }}
        <template v-if="current.value === 'ko'">{{ props.row.name_Ko }}</template>
        <template v-else>{{ props.row.name_En }}</template>
      </q-td>
    </template>
    <template v-slot:body-cell-category="props">
      <q-td :props="props">
        {{ options.gameCategory.filter((e: any) => e.value === props.row.category)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-state="props">
      <q-td :props="props">
        <a-switch v-model:checked="props.row.state" size="small" @change="onChange(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { extend } from 'quasar';
import dayjs from 'dayjs';
import { SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { message, SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, options, useFilter, dateFormat, pages } from 'src/boot/global';
import { FilterDefault, GameCategory, SiteGrade } from 'src/components/models/enums';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());
const { current } = storeToRefs(commonStore.locale());

const tableRef = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const total = ref<number>(0);
const pagination = ref({ ...pages, rowsNumber: 10 });
const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({
  type: FilterDefault.All,
  category: GameCategory.All,
  text: '',
});
const searchSendData = ref<ISearch>({
  type: FilterDefault.All,
  category: GameCategory.All,
  text: '',
});

const columns = ref<any[]>([
  {
    name: 'solution_Name',
    field: 'solution_Name',
    required: true,
    label: 'table.thead.solution_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'vendor_Name',
    field: 'vendor_Name',
    required: true,
    label: 'table.thead.vendor_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'img',
    field: 'img',
    required: true,
    label: 'table.thead.img',
    align: 'left',
    sortable: true,
  },
  {
    name: 'state',
    field: 'state',
    required: true,
    label: 'table.thead.state',
    align: 'left',
    sortable: true,
  },
  {
    name: 'category',
    field: 'category',
    required: true,
    label: 'table.thead.category',
    align: 'left',
    sortable: true,
  },
  {
    name: 'addTime',
    field: 'addTime',
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
    category: searchSendData.value.category,
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.VendorList(send);

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

const onChange = async (e: any) => {
  try {
    const response = await apis.manager.VendorState({
      idx: e.idx,
      state: e.state,
    });
    if (response.data.errCode === 0) {
      message.success(response.data.errMessage);
      onRefresh();
    }
  } catch (error) {
    console.error(error);
  }
};

const onSearch = () => {
  pagination.value.page = 1;
  searchSendData.value = extend(true, {}, search.value);
  onRefresh();
};

onMounted(() => {
  let useOption = siteIdx.value === SiteGrade.Admin ? [FilterDefault.All, FilterDefault.SiteName] : [FilterDefault.All];

  const custom = [
    { value: 2, label: () => t('common.label.vendor_name') },
    { value: 3, label: () => t('common.label.solution_name') },
    { value: 4, label: () => t('common.label.game_name') },
  ];
  searchOption.value = useFilter(useOption, options.filterDefault, custom);
  onRefresh();
});
</script>
