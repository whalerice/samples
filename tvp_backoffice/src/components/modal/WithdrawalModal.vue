<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('common.word.partner_withdrawal_request')"
    :bodyStyle="{ padding: 0 }"
    :footer="null"
    :width="1400"
    :destroyOnClose="true"
  >
    <PartnerTransactionStatusPage :isTop="true" v-if="visible" />
  </a-modal>
</template>

<script setup lang="ts">
import PartnerTransactionStatusPage from '@/pages/PartnerTransactionStatusPage.vue';
import { computed } from 'vue';

const props = defineProps({
  show: { type: Boolean },
});

const emits = defineEmits(['update:show']);

const visible = computed({
  get() {
    return props.show;
  },
  set: (value: boolean) => {
    emits('update:show', value);
  },
});
</script>
