<template>
  <a-list class="wallet-by-coin" :data-source="data" item-layout="horizontal">
    <template #renderItem="{ item }">
      <a-list-item>
        <div class="flex-row">
          <i :class="`coin mr-10 coin-${item.coin_Cd}`" />
          <div class="flex-col coin-name">
            <span>{{ item?.symbol }}</span>
            <span v-if="!isMobile"
              >(1 {{ item?.symbol }} = {{ partnerInfo.type }} {{ comma(item?.currencyPrice) }})</span
            >
          </div>
        </div>
        <div class="flex-row">
          <div class="flex-col align-end mr-30">
            <span>{{ comma(item?.balance) }}</span>
            <span>{{ partnerInfo.type }} {{ comma(item?.totalCurrencyPrice) }}</span>
          </div>
          <div class="flex-col align-end">
            <a-typography-text type="secondary" class="addr" :copyable="{ text: `${item?.wallet_Addr}` }">
              {{ $t('datatable.thead.addr') }}
            </a-typography-text>

            <a-typography-text
              v-if="item?.coin_Cd === 4"
              type="secondary"
              class="addr"
              :copyable="{ text: `${item?.memo}` }"
            >
              Tag
            </a-typography-text>
          </div>
        </div>
      </a-list-item>
    </template>
  </a-list>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { comma } from '@/assets/js/global.js';

const store = useStore();
const wallet = computed(() => store.state['sign'].partnerWallets);
const partnerInfo = computed(() => store.state['sign'].partnerInfo);
const isDeviceMobile = computed(() => store.state['common'].isDeviceMobile);
const data = ref([]);
const isMobile = ref(isDeviceMobile.value);
watch(wallet, (val) => {
  data.value = val;
});

onMounted(async () => {
  await store.dispatch('sign/partnerWalletInfo');
  data.value = wallet.value;
});
</script>
