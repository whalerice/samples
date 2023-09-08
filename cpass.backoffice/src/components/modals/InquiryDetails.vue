<template>
  <a-modal v-model:visible="isShow" centered :title="$t('modal.title.inquiry_details')">
    <a-form layout="vertical" class="inquiry-details-box">
      <a-form-item :label="$t('modal.label.state')">
        {{ inquiryContent.state }}
      </a-form-item>
      <a-form-item :label="$t('modal.label.subject')">
        {{ inquiryContent.title }}
      </a-form-item>
      <a-form-item :label="$t('modal.label.message')">
        {{ inquiryContent.message }}
      </a-form-item>
      <a-form-item :label="$t('modal.label.answer')" v-if="inquiryContent.state === 'Completed'">
        {{ inquiryContent.answer }}
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button key="close" type="primary" @click="closeModal">
        {{ $t('common.button.close') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open', 'close']);

const isShow = computed({
  get() {
    return props.show;
  },
  set(value) {
    emit('close', value);
  },
});

const inquiryContent = computed({
  get() {
    return props.content;
  },
});

const closeModal = () => {
  isShow.value = false;
};
</script>
