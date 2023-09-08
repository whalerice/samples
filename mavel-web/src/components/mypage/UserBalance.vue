<template>
  <div class="header-label">
    <h4>{{ $t('tab.title.balance') }}</h4>
  </div>

  <div class="row q-gutter-sm">
    <template v-for="(data, i) in $BALANCE_LIST" :key="data.label">
      <div class="point-container col-12 col-md-4 flex-1" v-if="data.state === 0 || data.state === userInfo.rewardType">
        <div class="column">
          <div class="row justify-between mb-24">
            <div class="column">
              <span class="point-label mb-05">{{ $t(`common.label.${data.label}`) }}</span>
              <Vue3Autocounter
                class="text-cash fs-24"
                ref="counter"
                :startAmount="0"
                :endAmount="payInfo[data.label]"
                :duration="2"
                :decimals="2"
                separator=","
                :autoinit="true" />
            </div>
            <div class="cash">
              <q-icon :name="`svguse:icons.svg#custom-${data.label}`" size="3.8rem" />
            </div>
          </div>
          <div>
            <template v-if="i === 0">
              <q-btn
                rounded
                no-caps
                unelevated
                class="point-btn-controller mr-13 bg-custom-yellow-01"
                :label="$t('common.button.deposit')"
                @click="showDeposit" />
              <q-btn
                rounded
                no-caps
                unelevated
                class="point-btn-controller bg-custom-green-01"
                :label="$t('common.button.withdrawal')"
                @click="showWithdrawal" />
            </template>
            <q-btn
              rounded
              no-caps
              unelevated
              class="point-btn-controller bg-custom-blue-01"
              :label="$t('common.button.for_cash')"
              @click="showDialog('point')"
              v-if="i === 1" />
            <q-btn
              rounded
              no-caps
              unelevated
              class="point-btn-controller bg-custom-pink-01"
              :label="$t('common.button.withdrawal')"
              @click="showDialog('rolling')"
              v-if="i === 2" />
            <q-btn
              rounded
              no-caps
              unelevated
              class="point-btn-controller bg-custom-purple-03"
              :label="$t('common.button.withdrawal')"
              @click="showDialog('losing')"
              v-if="i === 3" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Vue3Autocounter from 'vue3-autocounter';

import { storeToRefs } from 'pinia';
import { userStore } from 'src/stores/user';
import { paymentStore } from 'src/stores/payment';
import { ref, watch } from 'vue';

const { userInfo, payInfo } = storeToRefs(userStore.user());
const { showDeposit, showWithdrawal, showDialog } = paymentStore.payment();

const counter = ref<any>(null);

const refresh = (num: number) => {
  if (num !== 3) {
    counter.value[num].start();
  }
};

watch(
  () => payInfo.value,
  (newValue, oldValue) => {
    const keys = Object.keys(oldValue);
    const values = Object.values(oldValue);

    values.filter((e, index) => {
      if (newValue[keys[index]] !== e) {
        refresh(index);
      }
    });
  },
);
</script>
