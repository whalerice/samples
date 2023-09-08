<template>
  <a-modal v-model:visible="isShow.isModalVisible" :closable="false">
    <span v-if="clickedBtnProp?.label === 'Sender'">
      {{ $t('modal.description.dispute', { first: $t('common.button.receiver'), second: $t('common.button.sender') }) }}
    </span>
    <span v-if="clickedBtnProp?.label === 'Receiver'">
      {{ $t('modal.description.dispute', { first: $t('common.button.sender'), second: $t('common.button.receiver') }) }}
    </span>
    <span v-if="clickedBtnProp?.label === 'Restore'">
      {{ $t('modal.description.dispute_restore') }}
    </span>
    <template #footer>
      <a-button key="close" @click="closeModal">{{ $t('common.button.cancel') }}</a-button>
      <a-button key="confirm" type="primary" @click="openConfirmation">{{ $t('common.button.ok') }}</a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: {
    type: Object,
    required: true,
  },
  clickedBtn: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const clickedBtnProp = computed({
  get() {
    return props.clickedBtn;
  },
});

const isShow = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('close', value, clickedBtnProp.value);
  },
});

const openConfirmation = () => {
  clickedBtnProp.value.isConfirmBtnClicked = true;
  emit('close', true, clickedBtnProp.value);
};

const closeModal = () => {
  emit('close', false, clickedBtnProp.value);
};
</script>
