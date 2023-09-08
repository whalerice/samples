<template>
  <a-card size="small" class="search-area">
    <a-space>
      <a-select v-model:value="search.category" :options="options.gameCategory"></a-select>
      <a-select v-model:value="search.designation" :options="options.gameDesignation"></a-select>
      <!-- <a-range-picker v-model:value="search.date" :format="dateFormat" /> -->
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
    row-key="name"
    no-data-label="noData"
    color="primary"
    binary-state-sort
    :pagination="pagination"
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

    <template v-slot:body-cell-img="props">
      <q-td :props="props">
        <a-image :width="100" :src="props.row.img" />
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <template v-if="current.value === 'ko'">{{ props.row.name_Ko }}</template>
        <template v-else>{{ props.row.name_En }}</template>
      </q-td>
    </template>

    <template v-slot:body-cell-game_Category="props">
      <q-td :props="props">
        {{ options.gameCategory.filter((e: any) => e.value === props.row.game_Category)[0].label() }}
      </q-td>
    </template>
    <template v-slot:body-cell-category="props">
      <q-td :props="props">
        {{ props.row.category === GameDesignation.Hot ? 'Hot' : 'Favorite' }}
        <!-- {{ props.row.isView }} -->
      </q-td>
    </template>
    <template v-slot:body-cell-operation="props">
      <q-td :props="props">
        <a-button type="primary" ghost size="small" danger @click="onDelete(props.row)">
          {{ $t('common.button.delete') }}
        </a-button>
        <!-- {{ props.row.category === GameDesignation.Hot ? 'Hot' : 'Favorite' }} -->
        <!-- {{ props.row.isView }} -->
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import NoData from 'components/NoData.vue';
import TableSkeleton from 'components/TableSkeleton.vue';

import { extend } from 'quasar';
import { SearchOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { message, SelectProps } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { pageOptions, options, useFilter, pages } from 'src/boot/global';
import { FilterDefault, GameCategory, GameDesignation, SiteGrade } from 'src/components/models/enums';
import { commonStore } from 'src/stores/common';
import { userStore } from 'src/stores/user';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const { siteIdx } = storeToRefs(userStore.user());
const { current } = storeToRefs(commonStore.locale());

const rows = ref<any[]>([]);
const loading = ref(false);
const pagination = ref(pages);

const searchOption = ref<SelectProps['options']>([]);
const search = ref<ISearch>({
  type: FilterDefault.All,
  category: GameCategory.All,
  designation: GameDesignation.All,
  text: '',
});
const searchSendData = ref<ISearch>({
  type: FilterDefault.All,
  category: GameCategory.All,
  designation: GameDesignation.All,
  text: '',
});

const columns = ref<any[]>([
  {
    name: 'category',
    field: 'category',
    required: true,
    label: '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'game_Category',
    field: 'game_Category',
    required: true,
    label: 'table.thead.category',
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
    sortable: false,
  },
  {
    name: 'name',
    field: 'name',
    required: true,
    label: 'table.thead.game_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'operation',
    field: 'operation',
    required: true,
    label: 'table.thead.operation',
    align: 'left',
    sortable: false,
  },
]);

const onRequest = async () => {
  loading.value = true;

  const send = {
    category: searchSendData.value.designation,
    game_Category: searchSendData.value.category,
    user_Filter: searchSendData.value.type,
    search: searchSendData.value.text,
  };

  try {
    const response = await apis.manager.MainOpenGameList(send);
    if (response.data.errCode === 0) {
      const returnData = response.data.returnData;
      rows.value = returnData;
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onDelete = async (e: any) => {
  loading.value = true;
  try {
    const response = await apis.manager.SelectionGameState({
      idx: e.idx,
      IsView: false,
    });
    if (response.data.errCode === 0) {
      message.success(response.data.errMessage);
      onRefresh();
    }
    loading.value = false;
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const onRefresh = async () => {
  await onRequest();
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
    { value: 3, label: () => t('common.label.game_name') },
  ];
  searchOption.value = useFilter(useOption, options.filterDefault, custom);
  onRefresh();
});
</script>
