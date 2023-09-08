<template>
  <a-card size="small" class="count-card">
    <template #title>
      <span>{{ props.title }}</span>
      <a-button type="text" @click="onRefresh" class="btn-refresh">
        <span>{{ $t('common.text.last') }} {{ currentTime }}</span>
        <fa-icon icon="arrows-rotate" :spin="isRefresh" />
      </a-button>
    </template>
    <template #extra v-if="props.href">
      <router-link :to="props.href" class="btn-shortcut">
        <span>{{ $t('common.button.shortcut') }}</span>
        <fa-icon icon="arrow-up-right-from-square" />
      </router-link>
    </template>
    <vue3-autocounter
      class="count"
      :startAmount="0"
      :endAmount="countNum"
      :duration="2"
      separator=","
      decimalSeparator="."
      :decimals="0"
      :autoinit="true"
      ref="$count"
    />
  </a-card>
</template>
<script setup>
import Vue3Autocounter from 'vue3-autocounter';

import { ref, onMounted, onBeforeUpdate } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: false,
  },
  count: {
    type: Number,
    required: true,
  },
  time: {
    type: String,
    required: false,
  },
});

const emit = defineEmits(['refresh']);

const $count = ref(null);
const countNum = ref(0);
const currentTime = ref('');
const isRefresh = ref(false);

const onRefresh = () => {
  isRefresh.value = true;
  currentTime.value = props.time;
  emit('refresh', props.title);
  $count.value.start();
  setTimeout(() => {
    isRefresh.value = false;
  }, 2000);
};

onMounted(() => {
  currentTime.value = props.time;
});
onBeforeUpdate(() => {
  countNum.value = props.count;
  onRefresh();
});
</script>
