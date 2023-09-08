<template>
  <a-card
    class="dashboard-wallet-tab"
    :class="{ 'mb-card': type === 'dashboard' }"
    :tab-list="walletTabComponentList"
    :active-tab-key="walletTab"
    @tabChange="(key) => (walletTab = key)"
  >
    <template #customTab="item">
      {{ item.tab() }}
    </template>
    <template
      v-for="(item, index) in walletTabComponentList"
      :key="index"
      :tab="item.tab()"
      :class="item.class !== undefined ? item.class : ''"
    >
      <Component :is="item.component" v-if="walletTab === item.key" :type="item?.type" :key="index" />
    </template>
  </a-card>
</template>

<script setup>
import SettlementApplication from '@/components/partner/SettlementApplication.vue';
import SwapApplication from '@/components/partner/SwapApplication.vue';
import WalletByCoin from '@/components/partner/WalletByCoin.vue';
import MyWalletPieChart from '@/components/partner/MyWalletPieChart.vue';
import RecentPartnerTransactionList from '@/components/datatable/RecentPartnerTransactionList.vue';

import { ref, markRaw, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  type: String,
});
const type = computed(() => props.type);
const walletTab = ref('common.label.balance');
const walletTabComponentList = [
  {
    key: 'common.label.balance',
    tab: () => t('common.label.balance'),
    component: markRaw(MyWalletPieChart),
    type: type,
  },
  { key: 'common.label.wallet_by_coin', tab: () => t('common.label.wallet_by_coin'), component: markRaw(WalletByCoin) },
  {
    key: 'common.button.send',
    tab: () => t('common.button.send'),
    component: markRaw(SettlementApplication),
    class: 'widget-settlement-swap',
  },
  {
    key: 'common.button.swap',
    tab: () => t('common.button.swap'),
    component: markRaw(SwapApplication),
    class: 'widget-settlement-swap',
  },
  {
    key: 'common.label.recent_list',
    tab: () => t('common.label.recent_list'),
    component: markRaw(RecentPartnerTransactionList),
  },
];
</script>

<style lang="scss"></style>
