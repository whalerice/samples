<template>
  <a-space :size="20">
    <span class="flex">
      <CoinIcon :coin-code="props.coinCode" size="21" />
      {{ coinLabel }}
    </span>
    <a-button
      type="text"
      @click="action(1)"
      :class="{ active: currentActive === 1 }"
    >
      <a-badge color="pink" />
      {{ $t('common.word.predict_amount') }}
    </a-button>
    <a-button
      type="text"
      @click="action(2)"
      :class="{ active: currentActive === 2 }"
    >
      <a-badge color="orange" />
      {{ $t('common.word.winning_amount') }}
    </a-button>
    <a-button
      type="text"
      @click="action(3)"
      :class="{ active: currentActive === 3 }"
    >
      <a-badge color="green" />
      {{ $t('common.word.profit') }}</a-button
    >
    <a-button
      type="text"
      @click="action(4)"
      :class="{ active: currentActive === 4 }"
      v-if="role !== roleNames.agent"
    >
      <a-badge color="purple" />
      {{ $t('common.word.fee') }}</a-button
    >
  </a-space>

  <a-row :gutter="[10, 30]" class="progress-area">
    <a-col :md="8" :xs="24" v-for="option in progress" :key="option">
      <label class="label">{{ option.name }}</label>
      <div class="progress-box">
        <a-progress
          type="circle"
          :show-info="false"
          :percent="option.value"
          :strokeColor="option.color"
        />
        <ul class="list">
          <li :class="{ active: currentActive === 1 }">
            <a-badge color="pink" />
            {{
              $comma(props.amountData.predictionAmountDetail[option.key] ?? 0)
            }}
          </li>
          <li :class="{ active: currentActive === 2 }">
            <a-badge color="orange" />
            {{ $comma(props.amountData.winningAmountDetail[option.key] ?? 0) }}
          </li>
          <li :class="{ active: currentActive === 3 }">
            <a-badge color="green" />
            {{ $comma(props.amountData.profitAmountDetail[option.key] ?? 0) }}
          </li>
          <li
            :class="{ active: currentActive === 4 }"
            v-if="props.amountData.feeAmountDetail && role !== roleNames.agent"
          >
            <a-badge color="purple" />
            {{ $comma(props.amountData.feeAmountDetail[option.key] ?? 0) }}
          </li>
        </ul>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';

import { PropType, computed, onMounted, ref, watch } from 'vue';
import { coinList } from '@/utils/constants';
import { CoinCode } from '@/utils/enums';
import { role } from '@/boot/global';
import { roleNames } from '@/router/routes';

const props = defineProps({
  amountData: {
    type: Object as PropType<IAmountData>,
    required: true,
  },
  coinCode: {
    type: Number,
    required: true,
    default: CoinCode.USDT,
  },
});

const coinLabel = computed(() => coinList[props.coinCode].label);

const isActive = ref<boolean>(false);
const currentActive = ref<number>(-1);

const action = (num: number) => {
  if (num === currentActive.value) {
    isActive.value = !isActive.value;

    if (!isActive.value) currentActive.value = -1;
    else currentActive.value = num;
  } else {
    isActive.value = true;
    currentActive.value = num;
  }
};

const cal = (val: number, all: number) => {
  return all === 0 ? 0 : (val / all) * 100;
};

const progress = ref<IPieChartOption[]>([
  { value: 0, key: 'UpDown', name: 'UP/DOWN', color: '#00c477' },
  { value: 0, key: 'EvenOdd', name: 'ODD/EVEN', color: '#dbb326' },
  { value: 0, key: 'BigSmall', name: 'BIG/SMALL', color: '#ff479f' },
]);

watch(props, (val) => {
  progress.value[0].value = cal(
    val.amountData['profitPredictionAmountDetail'].UpDown,
    val.amountData['predictionAmountDetail'].UpDown
  );
  progress.value[1].value = cal(
    val.amountData['profitPredictionAmountDetail'].EvenOdd,
    val.amountData['predictionAmountDetail'].EvenOdd
  );
  progress.value[2].value = cal(
    val.amountData['profitPredictionAmountDetail'].BigSmall,
    val.amountData['predictionAmountDetail'].BigSmall
  );
});

onMounted(() => {
  progress.value[0].value = cal(
    props.amountData['profitPredictionAmountDetail'].UpDown,
    props.amountData['predictionAmountDetail'].UpDown
  );
  progress.value[1].value = cal(
    props.amountData['profitPredictionAmountDetail'].EvenOdd,
    props.amountData['predictionAmountDetail'].EvenOdd
  );
  progress.value[2].value = cal(
    props.amountData['profitPredictionAmountDetail'].BigSmall,
    props.amountData['predictionAmountDetail'].BigSmall
  );
});
</script>
