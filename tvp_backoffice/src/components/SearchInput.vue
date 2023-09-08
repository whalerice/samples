<template>
  <a-input v-model:value="value" :placeholder="$t(props.label)" allow-clear />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const emits = defineEmits(['update:value']);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
});

const value = computed({
  get: () => props.value[props.id] || '',
  set: (value: any) => {
    emits('update:value', { ...props.value, [props.id]: value });
  },
});
</script>
