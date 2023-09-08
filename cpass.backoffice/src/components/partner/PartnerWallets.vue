<template>
  <a-row :gutter="[10, 10]">
    <a-col :xs="24" :md="12" :xxl="12" v-for="(item, idx) in wallet" :key="idx">
      <a-card class="" size="small">
        <h3 class="title flex">
          <i :class="`coin mr-10 coin-${item.coin_Cd}`" />
          <span>{{ item?.type }}</span>
        </h3>
        <div class="price-box" v-if="item?.coin_Cd !== 'USDT'">
          <div class="now-price" v-if="item?.currencyPrice !== 0">
            1 {{ item?.symbol }} = {{ partnerInfo.type }}{{ comma(item?.currencyPrice) }}
          </div>
          <div class="usdt-price" v-if="item?.totalCurrencyPrice !== 0">
            {{ partnerInfo.type }} {{ comma(item?.totalCurrencyPrice) }}
          </div>
          <div class="balance">{{ comma(item?.balance) }}</div>
        </div>
        <div class="coin-cd mt-10">
          <a-typography-text type="secondary" class="addr" copyable>
            {{ item?.wallet_Addr }}
          </a-typography-text>
          <div v-if="item?.coin_Cd === 4">
            Destination tag : <a-typography-text type="secondary" copyable>{{ item?.memo }}</a-typography-text>
          </div>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>
<script setup>
import { computed, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';

const store = useStore();
const wallet = computed(() => store.state['sign'].partnerWallets);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);

onBeforeMount(() => {
  store.dispatch('sign/partnerWalletInfo');
});
</script>
