<template>
  <div class="national-flag">
    <i
      style="margin-right: 5px"
      class="flag"
      :style="{
        'background-image': `url(http://purecatamphetamine.github.io/country-flag-icons/3x2/${data?.iso_Alpha2?.toUpperCase()}.svg)`,
      }"
    />
    <span style="line-height: 14px; font-weight: 500">
      {{ data?.country }}
    </span>
  </div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    require: true,
  },
});
const data = computed(() => props.data);
</script>
