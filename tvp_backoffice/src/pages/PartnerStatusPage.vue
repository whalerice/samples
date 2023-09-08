<template>
  <FilterCard :filters="filters" @search="search" />

  <a-table
    :showSorterTooltip="false"
    :columns="columns"
    :row-key="(record:IInvestmentEarningsResponse) => record.operatorId"
    :data-source="dataSource"
    :pagination="pagination"
    :loading="loading"
    :scroll="{ x: 1200 }"
    :expandedRowKeys="expandedRowKeys"
    @expand="expand"
    @change="paginationChanged"
  >
    <template #bodyCell="{ column, record, text }">
      <template v-if="column.dataIndex === 'email'">
        <a-typography-link @click="showInvestInfoModal(record)">
          {{ text }}
        </a-typography-link>
      </template>

      <template v-if="column.dataIndex === 'coinCode'">
        <CoinIcon :coin-code="text" />
      </template>

      <template v-if="column.dataIndex === 'state'">
        <a-typography-text type="primary" v-if="text === 7">
          {{ $t('common.word.status_normal') }}
        </a-typography-text>

        <a-typography-text type="danger" v-else>
          {{ $t('common.word.status_stop') }}
        </a-typography-text>
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <a-table
        :columns="innerColumns"
        :row-key="(record:any) => record.key"
        :data-source="record.wallet"
        :pagination="false"
        :loading="loading"
      >
        <template #bodyCell="{ column, record: _record, text: _text }">
          <template v-if="column.dataIndex === 'coinCode'">
            <CoinIcon :coin-code="_text" />
          </template>

          <template v-if="column.dataIndex === 'address'">
            <a-typography-paragraph
              class="linkable-text"
              copyable
              style="margin: 0"
            >
              {{ _record.address }}
            </a-typography-paragraph>
          </template>

          <template v-if="column.dataIndex === 'destinationTag'">
            <a-typography-paragraph
              v-if="_text"
              class="linkable-text"
              copyable
              style="margin: 0"
            >
              {{ _record.destinationTag }}
            </a-typography-paragraph>
          </template>
        </template>
      </a-table>
    </template>
  </a-table>

  <InvestorInformationModal
    :visible="isInvestModal"
    :operatorId="operatorId"
    @update:visible="(value:boolean) => isInvestModal = value"
  />
</template>

<script setup lang="ts">
import FilterCard from '@/components/FilterCard.vue';
import CoinIcon from '@/components/CoinIcon.vue';
import InvestorInformationModal from '@/components/modal/InvestorInformationModal.vue';

import { ColumnsType } from 'ant-design-vue/lib/table';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { comma, options } from '@/boot/global';
import { memberStatusOptions } from '@/utils/constants';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';

const route = useRoute();

const { t } = useI18n();
const expandedRowKeys = ref<string[]>([]);

const filters: IFilter[] = [
  {
    id: 'investmentStep',
    label: 'common.word.step',
    type: 'select',
    options: options.steps,
  },
  {
    id: 'memberState',
    label: 'common.word.status',
    type: 'select',
    options: memberStatusOptions,
  },
  {
    id: 'searchText',
    label: 'common.input.id_name_search',
    type: 'search',
  },
];

const operatorId = ref<string>('');
const isInvestModal = ref<boolean>(false);
const columns: ColumnsType = [
  {
    title: () => t('common.word.id'),
    dataIndex: 'email',
    sorter: true,
  },
  {
    title: () => t('common.word.partner_name'),
    dataIndex: 'nickname',
    sorter: true,
  },
  {
    title: () => t('common.word.invest_coin'),
    dataIndex: 'coinCode',
    sorter: true,
    align: 'center',
  },
  {
    title: () => t('common.word.balance_investment'),
    dataIndex: 'balance/investment',
    sorter: true,
    align: 'right',
    customRender: ({ record }) =>
      `${comma(record.balance)} / ${comma(record.originalBalance)}`,
  },
  {
    title: () => t('common.word.step'),
    dataIndex: 'step',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => t('common.word.step_number', { number: text }),
  },
  {
    title: () => t('common.word.predict_amount'),
    dataIndex: 'predictionAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.winning_amount'),
    dataIndex: 'winningAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.net_profit'),
    dataIndex: 'netProfitAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.deposit_amount'),
    dataIndex: 'depositAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.withdrawal_amount'),
    dataIndex: 'withdrawalAmount',
    sorter: true,
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
  {
    title: () => t('common.word.status'),
    dataIndex: 'state',
    sorter: true,
    align: 'center',
  },
];

const innerColumns = [
  {
    title: () => t('common.word.coin'),
    dataIndex: 'coinCode',
    align: 'center',
  },
  {
    title: () => t('common.word.wallet_address'),
    dataIndex: 'address',
  },
  {
    title: () => t('common.word.destination_tag'),
    dataIndex: 'destinationTag',
  },
  {
    title: () => t('common.word.quantity'),
    dataIndex: 'balance',
    align: 'right',
    customRender: ({ text }) => comma(text),
  },
];

const {
  data: dataSource,
  loading,
  pagination,
  search,
  paginationChanged,
} = useCustomPagination(
  async (params: any) => await api.auto.investment.earnings(params)
);

const expand = async (
  expanded: boolean,
  record: IInvestmentEarningsResponse
) => {
  expandedRowKeys.value = [];

  if (expanded) {
    expandedRowKeys.value = [record.operatorId];

    record.wallet = await api.auto.investment.earningWallet(record.operatorId);
  }
};

const showInvestInfoModal = (data: IInvestmentEarningsResponse) => {
  isInvestModal.value = true;
  operatorId.value = data.operatorId;
};
</script>
