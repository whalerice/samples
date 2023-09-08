<template>
  <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" class="no-data">
    <template #description> {{ $t(props.message) }} </template>
  </a-empty>
</template>

<script setup lang="ts">
import { Empty } from 'ant-design-vue';

const props = defineProps({
  message: {
    type: String,
    default: 'table.message.no_data',
    required: false,
  },
});
</script>
