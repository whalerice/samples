<template>
  <i
    class="ico-coin"
    :style="{
      'background-image': `url(/coins/${label?.toLowerCase()}.svg)`,
      width: `${props.size}px`,
      height: `${props.size}px`,
      'background-size': `${props.size}px`,
      'margin-right': `${props.marginRight}px`,
      margin: props.marginRight === 0 ? 'auto' : '',
    }"
  ></i>
</template>

<script setup lang="ts">
import { coinList } from '@/utils/constants';
import { CoinCode } from '@/utils/enums';
import { PropType, computed } from 'vue';

const props = defineProps({
  coinCode: Number as PropType<CoinCode>,
  marginRight: {
    type: [String, Number],
    default: '5',
  },
  size: {
    type: [String, Number],
    default: '20',
  },
});

const label = computed(() =>
  props.coinCode ? coinList[props.coinCode].label : ''
);
</script>
