<template>
  <q-item-section avatar>
    <q-icon :name="props.icon" class="default-custom-icon" />
  </q-item-section>

  <q-item-section>
    <q-item-label>{{ $t(title) }}</q-item-label>
  </q-item-section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  icon: String,
  title: { type: String, default: '' },
});

const title = computed(() => props.title);
</script>
