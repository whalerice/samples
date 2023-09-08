<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :title="$t('common.word.wallet')"
    :destroyOnClose="true"
  >
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="$t('common.word.holdings')">
        <a-row justify="center">
          <a-col :span="24">
            <PieChart
              v-if="chartOption"
              :chart-option="chartOption"
              show-legend
              style="height: 50rem"
            />
          </a-col>

          <a-col class="chart-total-container">
            <a-row justify="space-between">
              <a-col>
                {{ $t('common.word.total_assets') }}
              </a-col>
              <a-col style="font-size: 1.4rem">
                {{ $comma(totalAmount) }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-tab-pane>

      <a-tab-pane key="2" :tab="$t('common.word.wallet_by_coin')">
        <a-row
          v-for="(item, index) in wallets"
          :key="item.coinCode"
          align="middle"
          justify="space-between"
        >
          <a-divider v-if="index > 0"></a-divider>

          <a-row align="middle">
            <CoinIcon :coin-code="item.coinCode" size="35" />

            <a-row class="column q-ml-sm">
              <a-col>
                {{ coinList[item.coinCode].label }}
              </a-col>
              <a-col> {{ $comma(item.currencyPrice) }}</a-col>
            </a-row>
          </a-row>

          <a-row align="middle">
            <a-row class="column text-right q-mr-md">
              <a-col>
                <div>
                  {{ $comma(item.coinAmount) }}
                </div>
                <div>
                  {{ $comma(item.currencyAmount) }}
                </div>
              </a-col>
            </a-row>

            <a-row class="column linkable-text">
              <a-row>
                <a-col>
                  <div class="row justify-end">
                    {{ $t('common.word.short_wallet_address') }}
                    <a-typography-paragraph
                      class="linkable-text"
                      copyable
                      style="margin: 0"
                    >
                      <span style="display: none">
                        {{ item.walletAddress }}
                      </span>
                    </a-typography-paragraph>
                  </div>

                  <div v-if="item.destinationTag" class="row justify-end">
                    {{ $t('common.word.short_destination_tag') }}
                    <a-typography-paragraph
                      class="linkable-text"
                      copyable
                      style="margin: 0"
                    >
                      <span style="display: none">
                        {{ item.destinationTag }}
                      </span>
                    </a-typography-paragraph>
                  </div>
                </a-col>
              </a-row>
            </a-row>
          </a-row>
        </a-row>
      </a-tab-pane>

      <a-tab-pane key="3" :tab="$t('common.word.send')">
        <SendForm :wallets="wallets" />
      </a-tab-pane>

      <a-tab-pane key="4" :tab="$t('common.word.swap')">
        <SwapForm :wallets="wallets" />
      </a-tab-pane>

      <a-tab-pane key="5" :tab="$t('common.word.recent_history')">
        <a-table
          :row-key="(record:any) => record.key"
          :data-source="dataSource"
          :columns="columns"
          :pagination="pagination"
          :loading="loading"
          @change="paginationChanged"
        >
          <template #headerCell="{ title }">
            {{ $t(title) }}
          </template>

          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'separation'">
              {{
                text === 0
                  ? $t('common.word.withdrawal_request')
                  : text === 1
                  ? $t('common.word.swap')
                  : text === 2
                  ? $t('common.word.receive')
                  : $t('common.word.send')
              }}
            </template>

            <template v-if="column.dataIndex === 'coinCode'">
              <CoinIcon :coin-code="text" />
            </template>

            <template v-if="column.dataIndex === 'actual'">
              {{ $comma(text) }}
            </template>

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
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import PieChart from '@/components/chart/PieChart.vue';
import CoinIcon from '@/components/CoinIcon.vue';
import SendForm from '@/components/SendForm.vue';
import SwapForm from '@/components/SwapForm.vue';
import { computed, onMounted, ref } from 'vue';
import { TableColumnType } from 'ant-design-vue';
import { coinList } from '@/utils/constants';
import { api } from '@/boot/axios';
import { useCustomPagination } from '@/utils/pagination';
import { CoinCode } from '@/utils/enums';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
const activeKey = ref('1');

const colors: Record<CoinCode, string> = {
  [CoinCode.BTC]: '#00c477',
  [CoinCode.ETH]: '#f73c55',
  [CoinCode.USDT]: '#4062ff',
  [CoinCode.XRP]: '#dbb326',
  [CoinCode.TRX]: '#b651ec',
  [CoinCode.CPESO]: '#ff479f',
};

const chartOption = ref<any[]>();
const totalAmount = ref(0);

const columns: TableColumnType[] = [
  {
    title: 'common.word.request_date',
    dataIndex: 'requestDate',
    align: 'center',
  },
  {
    title: 'common.word.separation',
    dataIndex: 'paymentType',
    align: 'center',
  },
  {
    title: 'common.word.coin_type',
    dataIndex: 'coinCode',
    align: 'center',
  },
  {
    title: 'common.word.coin_quantity',
    dataIndex: 'actual',
    align: 'right',
  },
];

const {
  data: dataSource,
  loading,
  pagination,
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

const wallets = ref<IWallet[]>([]);

const loadWallets = async () => {
  const data = await api.auto.wallet.getWallets();

  wallets.value = data;

  chartOption.value = data.map((e) => ({
    name: coinList[e.coinCode].label,
    value: e.currencyAmount,
    color: colors[e.coinCode],
  }));

  totalAmount.value = data.reduce(
    (result, value) => result + value.currencyAmount,
    0
  );
};

onMounted(() => {
  loadWallets();
});
</script>
