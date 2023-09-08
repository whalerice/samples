<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :width="1200"
    :title="$t('common.word.settlement_amount')"
    :destroyOnClose="true"
  >
    <LosingRewardManagementPage :isTop="true" v-if="visible" />
  </a-modal>
</template>

<script setup lang="ts">
import LosingRewardManagementPage from '@/pages/LosingRewardManagementPage.vue';
import { computed } from 'vue';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emits('update:show', val);
  },
});
</script>
