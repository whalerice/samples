<template>
  <a-row class="indicator" :gutter="[10, 10]">
    <a-col :xs="24" :md="12" :lg="6" :xl="4" v-for="(item, idx) in list" :key="idx">
      <a-card
        :bodyStyle="{ padding: '0rem 1.5rem 1rem 1.5rem' }"
        size="small"
        :title="item.label()"
        class="indicator-auto"
      >
        <vue3-autocounter
          :key="forceRender"
          class="num"
          separator=","
          :startAmount="0"
          :endAmount="item.value"
          :duration="2"
          :autoinit="false"
          :ref="(el) => (counter[idx] = el)"
        />
        <div class="icon">
          <i class="ico" :class="`ico-${item.icon}`"></i>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>
<script setup>
import Vue3Autocounter from 'vue3-autocounter';

import { ref, watch, computed } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});
const list = computed(() => props.data);
const counter = ref([]);
const forceRender = ref(0);

watch(
  list,
  () => {
    forceRender.value += 1;
  },
  {
    deep: true,
  },
);

watch(
  counter,
  (val) => {
    counter.value.forEach((e) => {
      e.start();
    });
  },
  {
    deep: true,
  },
);
</script>
