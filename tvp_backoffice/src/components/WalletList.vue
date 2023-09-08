<template>
  <a-row :gutter="[8, 8]">
    <a-col v-for="item in props.wallets" :key="item.coinCode" :span="12">
      <a-card class="coin-card-container" style="height: 100%">
        <a-row align="middle" class="q-mb-md">
          <CoinIcon :coin-code="item.coinCode" />

          <span
            class="text-h5 text-weight-bold"
            style="transform: translateY(-0.1rem)"
          >
            {{ coinList[item.coinCode].fullName }}
          </span>
        </a-row>
        <a-row>
          1 {{ coinList[item.coinCode].label }} = ₩{{
            $comma(item.currencyPrice)
          }}
        </a-row>
        <a-row> ₩{{ $comma(item.currencyAmount) }} </a-row>
        <a-row> {{ $comma(item.coinAmount) }} </a-row>
        <a-typography-paragraph class="linkable-text q-mt-md" copyable>
          {{ item.walletAddress }}
        </a-typography-paragraph>
        <a-typography-paragraph
          class="linkable-text q-mt-md"
          copyable
          v-if="item.destinationTag"
        >
          {{ item.destinationTag }}
        </a-typography-paragraph>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';
import { coinList } from '@/utils/constants';
import { PropType } from 'vue';

const props = defineProps({
  wallets: Array as PropType<IWallet[]>,
});
</script>
