<template>
  <a-row :gutter="[20, 8]" class="q-mb-xl">
    <a-col :xs="24" :sm="24" :md="12">
      <a-card class="full-height" :bodyStyle="{ padding: 0 }">
        <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true">
          <a-tab-pane key="send" :tab="$t('common.word.send')" class="q-pa-md">
            <SendForm :wallets="wallets" />
          </a-tab-pane>

          <a-tab-pane key="swap" :tab="$t('common.word.swap')" class="q-pa-md">
            <SwapForm :wallets="wallets" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-col>

    <a-col :xs="24" :sm="24" :md="12">
      <WalletList :wallets="wallets" />
    </a-col>
  </a-row>

  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:any) => record.dealId"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1000 }"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'paymentType'">
        {{
          text === 0
            ? $t('common.word.send')
            : text === 1
            ? $t('common.word.receive')
            : text === 2
            ? $t('common.word.swap')
            : text === 3
            ? $t('common.word.deposit_pay')
            : $t('common.word.withdrawal_pay')
        }}
      </template>

      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>

      <template v-if="column.dataIndex === 'actual'">
        {{ $comma(text) }}
      </template>

      <template v-if="column.dataIndex === 'state'">
        <template v-if="text === 0">
          {{ $t('common.word.waiting_for_approval') }}
        </template>

        <template v-if="text === 1">
          {{ $t('common.word.waiting_for_transmission') }}
        </template>

        <template v-if="text === 2">
          {{ $t('common.word.success') }}
        </template>

        <template v-if="text === 3">
          {{ $t('common.word.fail') }}
        </template>

        <template v-if="text === 4">
          {{ $t('common.word.1st_approval_rejected') }}
        </template>

        <template v-if="text === 5">
          {{ $t('common.word.2st_approval_rejected') }}
        </template>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';
import SendForm from '@/components/SendForm.vue';
import SwapForm from '@/components/SwapForm.vue';
import WalletList from '@/components/WalletList.vue';

import { ref, onMounted } from 'vue';
import { TableColumnsType } from 'ant-design-vue';
import {
  walletSeparationOptions,
  walletStatusOptions,
} from '@/utils/constants';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const activeKey = ref('send');

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.reserve_date',
    type: 'date',
  },
  {
    id: 'updatedTime',
    label: 'common.word.proceed_date',
    type: 'date',
  },
  {
    id: 'createdTime',
    label: 'common.word.separation',
    type: 'date',
    options: walletSeparationOptions,
  },
  {
    id: 'updatedTime',
    label: 'common.word.status',
    type: 'date',
    options: walletStatusOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const columns: TableColumnsType = [
  {
    title: 'common.word.request_date',
    dataIndex: 'requestDate',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.proceed_date',
    dataIndex: 'processingDate',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.separation',
    dataIndex: 'paymentType',
    sorter: true,
  },
  {
    title: 'common.word.coin_type',
    dataIndex: 'coinCode',
    sorter: true,
    align: 'center',
  },
  {
    title: 'common.word.coin_quantity',
    dataIndex: 'actual',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.wallet_address',
    dataIndex: 'address',
    sorter: true,
  },
  {
    title: 'common.word.status',
    dataIndex: 'state',
    sorter: true,
  },
];

const sendData = ref<IWalletTransactionRequest>({
  currentPage: 1,
  currentPageSize: 10,
  requestBeforeDate: '',
  requestAfterDate: '',
  processingBeforeDate: '',
  processingAfterDate: '',
  activity: '',
  state: '',
  search: '',
  searchType: '',
  order: '',
  sort: '',
});

const wallets = ref<IWallet[]>([]);

const load = async () => {
  const data = await api.auto.wallet.getWallets();
  wallets.value = data;
};

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(async (params: any) => {
  const { skip, take, sort, ...options } = params;
  const currentPage = Math.ceil(skip / take) + 1;

  return await api.auto.wallet.getWalletTransactions({
    currentPage,
    currentPageSize: take,
    ...options,
  });
});

onMounted(() => {
  load();
});
</script>
