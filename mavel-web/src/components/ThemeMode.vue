<template>
  <q-toggle
    v-model:model-value="mode"
    checked-icon="dark_mode"
    color="blue"
    size="md"
    unchecked-icon="light_mode"
    @update:model-value="changeMode" />
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { commonStore } from 'src/stores/common';
const { changeMode } = commonStore.theme();

const mode = computed(() => commonStore.theme().currentTheme);
</script>
