<template>
  <a-modal
    centered
    :width="600"
    :title="$t('common.word.swap')"
    :destroyOnClose="true"
  >
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-row>
          <CoinIcon :coin-code="props.fromCoinCode" />
          {{ fromCoinLabel }}
        </a-row>
      </a-col>

      <a-col class="text-right">
        <div>{{ $comma(0) }} {{ fromCoinLabel }}</div>
        <div>{{ $comma(0) }}</div>
      </a-col>
    </a-row>
    <a-row justify="space-between">
      <a-col>
        {{ $t('common.word.transaction_fee') }}
      </a-col>
      <a-col> {{ $comma(13) }} {{ fromCoinLabel }} </a-col>
    </a-row>

    <a-divider></a-divider>

    <a-row justify="space-between">
      <a-col>
        <a-row>
          <CoinIcon :coin-code="props.toCoinCode" />
          {{ toCoinLabel }}
        </a-row>
      </a-col>

      <a-col class="text-right">
        <a-row>
          <a-col>
            <div>{{ $comma(0) }} {{ toCoinLabel }}</div>
            <div>{{ $comma(0) }}</div>
          </a-col>
          <a-col class="q-ml-sm">
            <a-progress
              type="circle"
              :percent="Number((timer * 5).toFixed())"
              :width="40"
            >
              <template #format>
                <span class="absolute-center txt" v-if="timer > 0">{{
                  timer.toFixed()
                }}</span>
                <div
                  v-else
                  class="cursor-pointer full-height bg-primary"
                  @click="reStart"
                >
                  <SyncOutlined
                    class="absolute-center text-white"
                    style="font-size: 2rem"
                  />
                </div>
              </template>
            </a-progress>
          </a-col>
        </a-row>
      </a-col>
    </a-row>

    <template #footer>
      <a-button type="primary" :disabled="timer < 0">
        {{ $t('common.word.swap') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';
import { ref, computed, watch, PropType } from 'vue';
import { SyncOutlined } from '@ant-design/icons-vue';
import { coinList } from '@/utils/constants';
const props = defineProps({
  fromCoinCode: Number as PropType<CoinCode>,
  fromQuantity: Number,
  toCoinCode: Number as PropType<CoinCode>,
  toQuantity: Number,
  show: Boolean,
});

const fromCoinLabel = computed(
  () => props.fromCoinCode && coinList[props.fromCoinCode].label
);
const toCoinLabel = computed(
  () => props.toCoinCode && coinList[props.toCoinCode].label
);
const show = computed(() => props.show);
const timer = ref(20);

let interval: NodeJS.Timer;

const startInterval = () => {
  timer.value = 20;

  interval = setInterval(() => {
    timer.value = timer.value - 0.1;

    if (timer.value < 0) {
      clearInterval(interval);
    }
  }, 100);
};

watch(show, (val) => {
  if (val) {
    startInterval();
  } else {
    clearInterval(interval);
  }
});

const reStart = () => {
  startInterval();
};
</script>
