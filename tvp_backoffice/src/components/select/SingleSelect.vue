<template>
  <a-select
    v-model:value="value"
    style="min-width: 10rem"
    class="custom-single-select"
    :placeholder="props.placeholder"
  >
    <a-select-option
      v-for="data in props.options"
      :value="data.value"
      :key="data.label"
      :label="data.label"
    >
      <span>{{ props.noTranslate ? data.label : $t(data.label) }}</span>
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  options: Object,
  value: [Number, String],
  noTranslate: Boolean,
  placeholder: String,
});

const value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emits('update:value', val);
  },
});
const emits = defineEmits(['update:value']);
</script>
