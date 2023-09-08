<template>
  <div class="text-h3 fw-700 mb-30">{{ $t('page.title.howtoplay') }}</div>
  <q-stepper v-model="step" header-nav vertical color="primary" animated>
    <q-step :name="i" :done="step > i" :title="data.title" icon="settings" v-for="(data, i) in text" :key="data.title">
      {{ data.content }}

      <q-stepper-navigation>
        <q-btn @click="step++" color="primary" :label="$t('common.button.next')" v-if="text.length > i + 1" />
        <q-btn @click="step--" :label="$t('common.button.back')" class="q-ml-sm" v-if="step !== 0" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>

  <div class="mt-20" style="width: 100%">
    <DownloadApp />
  </div>
</template>
<script setup lang="ts">
import DownloadApp from 'src/components/DownloadApp.vue';
import { ref } from 'vue';

const text = [
  {
    title: '1. How to use BTC, ETH, XRP etc',
    content:
      "First get you're a BTC, ETH, XRP, etc wallet. Secondly, exchange and online wallets. WALLET : BTC ETH XRP",
  },
  {
    title: '2. Click',
    content:
      'SIGNUP Located at the upper right corner of the screen By clicking SIGNUP BUTTON, you can become a VIP member of MAVEL GAMES in just few minutes.',
  },
  {
    title: '3. Funding your casino account',
    content: 'At MAVEL GAMES we have several deposit methods to suit you.',
  },
  {
    title: '4. Click SIGNUP Located at the upper right corner of the screen',
    content:
      'At MAVEL GAMES we have a lot of slots and table games to suit your gaming desire, Our Live Streaming Casino with sexy dealers provide real time interactive gaming in the comfort of your home.',
  },
  {
    title: '5. Withdraw your winnings!!!',
    content: 'When you win at the casino, you may withdraw your funds via your chosen method.',
  },
  {
    title: '6. How to buy BITCOIN ?',
    content: 'First, get your a bitcoin wallet. Secondly, exchanges and online wallets.',
  },
];

const step = ref<number>(0);
</script>
