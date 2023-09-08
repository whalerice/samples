<template>
  <a-row :gutter="[15, 15]">
    <a-col v-for="(item, index) in walletsInfo" :key="index" :xs="24" :md="12" :xxl="6">
      <a-card size="small" class="wallet-info-card">
        <template #title>
          <i :class="`coin coin-${item.coin_Cd}`" />
          <strong class="cd">{{ matchingCoinLabel(item.coin_Cd) }} Wallet</strong>
        </template>
        <h3 class="balance">{{ comma(item.balance) }}</h3>
        <a-typography-text type="secondary" class="addr" copyable>{{ item.wallet_Addr }}</a-typography-text>
      </a-card>
    </a-col>
  </a-row>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { comma, matchingCoinLabel, matchingCoinImg2 } from '@/assets/js/global.js';

const store = useStore();
const walletsInfo = computed(() => store.state['trade'].walletsInfo);

onMounted(async () => {
  await store.dispatch('trade/checkHardWallet');
});
</script>
