<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :title="$t('common.word.request_settlement')"
    :width="1000"
    :bodyStyle="{ padding: 0 }"
    :destroyOnClose="true"
  >
    <SettlementManagementPage :isTop="true" v-if="visible" />
  </a-modal>
</template>

<script setup lang="ts">
import SettlementManagementPage from '@/pages/SettlementManagementPage.vue';
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
