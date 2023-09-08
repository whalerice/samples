<template>
  <a-space align="center">
    <a-typography-text
      :type="
        props.type === TransactionStatus.Completed
          ? 'success'
          : props.type === TransactionStatus.Rejected
          ? 'danger'
          : ''
      "
    >
      {{
        props.type === TransactionStatus.OnRequest
          ? $t('common.word.proceeding')
          : props.type === TransactionStatus.Completed
          ? $t('common.word.complete')
          : props.type === TransactionStatus.Rejected
          ? $t('common.word.refusal')
          : props.type
      }}
    </a-typography-text>

    <template v-if="props.type === TransactionStatus.OnRequest">
      <a-button danger @click="confirm(false)">
        {{ $t('common.word.refusal') }}
      </a-button>
      <a-button type="primary" @click="confirm(true)">
        {{ $t('common.word.approval') }}
      </a-button>
    </template>
  </a-space>

  <ConfirmPasswordModal
    :visible="isConfirmPasswordModal"
    :data="sendData"
    @return="confirmFeedback"
  />
</template>

<script setup lang="ts">
import ConfirmPasswordModal from '@/components/modal/ConfirmPasswordModal.vue';
import { ref, PropType } from 'vue';
import { TransactionStatus } from '@/utils/enums';

const props = defineProps({
  record: {
    type: Object as PropType<IInvestmentResponse>,
    default: () => {
      return {};
    },
  },
  type: {
    type: Number,
    required: true,
  },
});

const emits = defineEmits(['transaction']);

const isConfirmPasswordModal = ref<boolean>(false);
const sendData = ref<any>();

const confirm = (status: boolean) => {
  isConfirmPasswordModal.value = true;
  sendData.value = {
    id: props.record.transactionId,
    isApproved: status,
  };
};

const confirmFeedback = (data: any) => {
  isConfirmPasswordModal.value = false;
  emits('transaction', {
    id: props.record.investmentPoolTransactionId,
    isApproved: data.isApproved,
  });
};
</script>
