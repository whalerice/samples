<template>
  <button class="circle-progress" @click="refreshTime" v-if="isTriggeredProp">
    <circle-progress
      :show-percent="false"
      :percent="circlePercent"
      :fill-color="circleLineColor"
      :empty-color="circleBgColor"
      :border-width="2.5"
      :border-bg-width="2.5"
      :size="34"
      :transition="0"
    />
    <span :class="['circle-time', { refresh: timeLimit === 0 }]">{{ timeLimit }}</span>
  </button>
</template>
<script setup>
import 'vue3-circle-progress/dist/circle-progress.css';
import CircleProgress from 'vue3-circle-progress';

import { ref, computed, watch, onMounted } from 'vue';

const circleLineColor = ref('#bdbdbd');
const circleBgColor = ref('#1890ff');
const circlePercent = ref(0);

const props = defineProps({
  isTriggered: {
    type: Boolean,
    required: true,
  },
  countDownSet: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['refresh', 'trigger', 'finish']);

const isTriggeredProp = computed({
  get() {
    return props.isTriggered;
  },
  set(val) {
    emit('trigger', val);
  },
});

const countDownSetProp = computed({
  get() {
    return props.countDownSet;
  },
});

const timeLimit = ref(countDownSetProp.value.timeLimit);

let countDown;
let circleControler;
const onClickCountDown = () => {
  countDown = setInterval(() => {
    timeLimit.value--;
    if (timeLimit.value === 0) {
      clearInterval(countDown);
    }
  }, countDownSetProp.value.countDownTime);

  circleControler = setInterval(() => {
    circlePercent.value--;
    if (timeLimit.value === 0) {
      clearInterval(circleControler);
    }
  }, countDownSetProp.value.circleControlerTime);
};

const refreshTime = () => {
  clearInterval(countDown);
  clearInterval(circleControler);
  timeLimit.value = countDownSetProp.value.timeLimit;
  circlePercent.value = 0;
  onClickCountDown();
  emit('refresh');
};

watch(isTriggeredProp, (val) => {
  if (val === true) {
    refreshTime();
  } else {
    clearInterval(countDown);
    clearInterval(circleControler);
    timeLimit.value = countDownSetProp.value.timeLimit;
    circlePercent.value = 0;
  }
});

watch(timeLimit, (val) => {
  emit('finish', val === 0 ? true : false);
});

onMounted(() => {
  refreshTime();
});
</script>
