<template>
  <section class="section bottom-nav">
    <BottomNav :dense="true" addClass="f-nav-item" />
  </section>
  <section class="section">
    <span class="text-body2">{{ $t('footer.desc.gambling') }}</span>
  </section>
  <section class="section">
    <img src="/images/mga_logo.png" alt="mga-logo" class="img-mga-logo" />
    <!-- <span class="mga-logo"></span> -->
  </section>
  <section class="section">
    <p>{{ $t('footer.label.payment_methods') }}</p>
    <ul class="payment-list">
      <li v-for="payment in paymentList" :key="payment" class="payment-item">
        <img :src="`/images/payments/${payment}.svg`" :alt="payment" class="payment-img" />
      </li>
    </ul>
  </section>
  <section class="section-copy">
    <span class="copy">Copyright © 2022-2023 MAVEL GAMES. All Rights Reserved.</span>
  </section>
  <!-- <q-scroll-observer @scroll="onScroll" /> -->
  <!-- <q-page-scroller position="bottom-right" :offset="[18, 18]">
    <q-btn fab icon="keyboard_arrow_up" color="accent" />
  </q-page-scroller> -->
  <!-- <q-btn fab icon="keyboard_arrow_up" color="accent" /> -->
</template>
<script setup lang="ts">
import BottomNav from 'layouts/BottomNav.vue';

import { ref } from 'vue';
const paymentList = ref<string[]>([
  'visamasterc',
  'cpass',
  'astropay-card',
  'trustly-01',
  'interac-grey-new',
  'euteller',
  'giropay',
  'rapidtransfer',
  'neteller',
  'skrill',
  'ecopayz',
  'muchbetter',
  'evoucher-grey',
  'paysafecard',
  'zimpler-2022',
]);
</script>
