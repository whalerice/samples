<template>
  <a-card :bodyStyle="{ padding: 0 }">
    <a-tabs
      v-model:activeKey="activeKey"
      :destroyInactiveTabPane="true"
      @change="change"
    >
      <a-tab-pane :key="1" :tab="$t('common.word.today')" class="q-pa-md">
        <StatisticAction
          :data="data"
          :list="list"
          :grid="[12, 6, 6]"
          :unit="unit"
        />
      </a-tab-pane>
      <a-tab-pane
        :key="0"
        :tab="$t('common.word.all')"
        class="q-pa-md"
        force-render
      >
        <StatisticAction
          :data="data"
          :list="list"
          :grid="[12, 6, 6]"
          :unit="unit"
        />
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup lang="ts">
import StatisticAction from '@/components/StatisticAction.vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/boot/axios';

const { t } = useI18n();
const list = [
  {
    label: () => t('common.word.net_profit'),
    value: 'netProfitAmount',
  },
  {
    label: () => t('common.word.predict_amount'),
    value: 'predictionAmount',
  },
  {
    label: () => t('common.word.profit'),
    value: 'profitAmount',
  },
  {
    label: () => t('common.word.settlement_amount'),
    value: 'settlementAmount',
  },
];

const data = ref<any>({
  netProfitAmount: 0,
  predictionAmount: 0,
  profitAmount: 0,
  settlementAmount: 0,
});

const activeKey = ref(1);
const unit = ref<string>('USDT');

const change = async (key: number) => {
  data.value = await api.auto.summary.investmentDetail(key);
};

onBeforeMount(() => {
  change(activeKey.value);
});
</script>
