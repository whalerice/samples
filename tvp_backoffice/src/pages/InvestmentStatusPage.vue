<template>
  <div class="q-mb-xl">
    <a-card>
      <a-row :gutter="[50, 20]">
        <a-col :xs="24" :lg="12">
          <InvestmentStatus
            :isReload="isInvestmentStatusReload"
            @update="updateInvestmentStatus"
          />

          <a-row align="center" justify="space-between" class="q-my-md">
            <a-col>
              {{ $t('common.word.investment_step') }}
            </a-col>
            <a-col>
              <a-row align="middle" :gutter="[5, 0]">
                <a-col>
                  {{ $t('common.word.step_number', { number: step }) }}
                </a-col>
              </a-row>
            </a-col>
          </a-row>

          <a-row align="center" justify="space-between">
            <a-col>
              {{ $t('common.word.withdrawal_status') }}
            </a-col>
            <a-col>
              <a-row align="middle" :gutter="[5, 0]">
                <a-col>
                  {{
                    investmentResponse.balance > 0
                      ? $t('common.word.possible')
                      : $t('common.word.impossible')
                  }}
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true">
            <a-tab-pane
              v-for="item in options.transaction"
              :key="item.value"
              :tab="item.label()"
            >
              <TransactionForm :type="item.value" @update="transactionUpdate" />
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </a-card>
  </div>

  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :data-source="dataSource"
    :columns="columns"
    :row-key="(record:any) => record.key"
    :pagination="pagination"
    :loading="loading"
    @change="paginationChanged"
  >
    <template #headerCell="{ title }">
      {{ $t(title) }}
    </template>
    <template #bodyCell="{ column, text }">
      <template
        v-if="['createdTime', 'completedTime'].includes(column.dataIndex)"
      >
        {{ text === null ? '' : $dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'type'">
        {{
          text === 0 ? $t('common.word.withdrawal') : $t('common.word.deposit')
        }}
      </template>
      <template
        v-if="
          ['beforeBalance', 'requestAmount', 'afterBalance'].includes(
            column.dataIndex
          )
        "
      >
        {{ $comma(text) }}
      </template>
      <template v-if="column.dataIndex === 'status'">
        <a-typography-text
          :type="text === 1 ? 'primary' : text !== 0 ? 'danger' : ''"
        >
          {{
            text === 0
              ? $t('common.word.proceeding')
              : text === 1
              ? $t('common.word.complete')
              : $t('common.word.refusal')
          }}
        </a-typography-text>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import TransactionForm from '@/components/TransactionForm.vue';
import FilterCard from '@/components/FilterCard.vue';
import InvestmentStatus from '@/components/InvestmentStatus.vue';

import { ref } from 'vue';
import { TableColumnsType } from 'ant-design-vue';

import { depWitOptions, depWitStatus3Options } from '@/utils/constants';
import { TransactionType } from '@/utils/enums';
import { options } from '@/boot/global';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const filters: IFilter[] = [
  {
    id: 'createdTime',
    label: 'common.word.request_date',
    type: 'date',
  },
  {
    id: 'completedTime',
    label: 'common.word.proceed_date',
    type: 'date',
  },
  {
    id: 'transactionType',
    label: 'common.word.deposit_withdrawal',
    type: 'select',
    options: depWitOptions,
  },
  {
    id: 'transactionStatus',
    label: 'common.word.status',
    type: 'select',
    options: depWitStatus3Options,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const isInvestmentStatusReload = ref<boolean>(false);
const activeKey = ref(TransactionType.Deposit);

const investmentResponse = ref<ISummaryInvestmentResponse>({
  balance: 0,
  originalBalance: 0,
  partnerTotalCount: 0,
  stepCounts: {
    zero: 0,
    one: 0,
    two: 0,
    three: 0,
    four: 0,
  },
});
const step = ref(0);

const columns: TableColumnsType = [
  {
    title: 'common.word.request_date',
    dataIndex: 'createdTime',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.proceed_date',
    dataIndex: 'completedTime',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.deposit_withdrawal',
    dataIndex: 'type',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.previous_balance',
    dataIndex: 'beforeBalance',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.request_amount',
    dataIndex: 'requestAmount',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.processing_after_balance',
    dataIndex: 'afterBalance',
    sorter: true,
    align: 'right',
  },
  {
    title: 'common.word.status',
    dataIndex: 'status',
    sorter: true,
    align: 'center',
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.investment.investment(params)
);

const updateInvestmentStatus = (item: ISummaryInvestmentResponse) => {
  investmentResponse.value = item;
};

const transactionUpdate = async (value: boolean) => {
  if (value) {
    search();
  }
};
</script>
