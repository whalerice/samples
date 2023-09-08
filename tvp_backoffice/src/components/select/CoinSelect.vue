<template>
  <a-select
    size="default"
    v-model:value="value"
    :placeholder="$t('common.word.select_coin')"
    class="custom-single-select"
    :disabled="disabled"
  >
    <a-select-option
      v-for="coin in coinList"
      :value="coin.value"
      :key="coin.label"
    >
      <a-row align="middle">
        <CoinIcon :coin-code="coin.value" />
        {{ coin.label }}
      </a-row>
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import CoinIcon from '@/components/CoinIcon.vue';
import { computed, PropType } from 'vue';

const props = defineProps({
  options: Object,
  value: Number,
  noTranslate: Boolean,
  coinList: { type: Object as PropType<ICoinMap> },
  disabled: Boolean,
});
const emits = defineEmits(['update:value']);

const value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emits('update:value', val);
  },
});

const coinList = computed(() => props.coinList);
</script>
