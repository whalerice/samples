<template>
  <a-row justify="space-between">
    <span>{{
      props.step ? $t('common.word.step_number', { number: stepNum }) : ''
    }}</span>
    <span
      >{{ $comma(data.balance) }} / {{ $comma(data.originalBalance) }}
      {{ coinName }}</span
    >
  </a-row>
  <div class="progress-content q-mt-sm">
    <a-progress
      strokeWidth="20"
      :stroke-color="{
        from: '#108ee9',
        to: '#87d068',
      }"
      :percent="percent"
      status="active"
      :show-info="false"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed, watch } from 'vue';
import { api } from '@/boot/axios';

const emits = defineEmits(['update']);
const props = defineProps({
  step: { type: Boolean, required: false },
  isReload: { type: Boolean, required: false },
});

const reload = computed({
  get() {
    return props.isReload;
  },
  set: (value: boolean) => {
    return value;
  },
});

const coinName = ref<string>('USDT');
const percent = ref<number>(0);
const stepNum = ref(0);

const data = ref<ISummaryInvestmentResponse>({
  stepCounts: {
    four: 0,
    three: 0,
    two: 0,
    one: 0,
    zero: 0,
  },
  originalBalance: 0,
  balance: 0,
  partnerTotalCount: 0,
});

const getInvestmentStatus = async () => {
  data.value = await api.auto.summary.investment();
  percent.value = (data.value.balance / data.value.originalBalance) * 100;
  Object.values(data.value.stepCounts).map((e, i) =>
    e > 0 ? (stepNum.value = i) : 0
  );

  if (props.isReload) emits('update', data.value, stepNum.value, reload.value);
  else emits('update', data.value, stepNum.value);
};

watch(props, async (value) => {
  if (value.isReload) await getInvestmentStatus();
});

onBeforeMount(async () => {
  await getInvestmentStatus();
});
</script>
