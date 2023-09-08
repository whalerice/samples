<template>
  <CpesoConfirmPassword :show="confirmVisible" @closeConfirm="closeConfirm" @confirmPassword="returnConfirmPassword" />
  <RefusalReasonModal
    :data="refusalOptions"
    :label="refusalLabel"
    :visible="refusalVisible"
    @close="closeRefusal"
    @returnRefusal="returnRefusal"
  />
</template>
<script setup>
import CpesoConfirmPassword from '@/components/modals/CpesoConfirmPassword.vue';
import RefusalReasonModal from '@/components/modals/RefusalReasonModal.vue';

import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Object,
    require: true,
  },
  visible: {
    type: Boolean,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
});
const emits = defineEmits(['close', 'return']);
const type = computed(() => props.type);
const visible = computed({
  get() {
    return props.visible;
  },
  set() {
    emits('close', false);
  },
});
const refusalVisible = ref(false);
const confirmVisible = ref(false);
const sendData = ref({
  type: '',
  content: '',
  signature: '',
});
const refusalOptions = computed(() => props.data?.refusalOptions);
const refusalLabel = computed(() => props.data?.refusalLabel);
const confirmLabel = computed(() => props.data.confirmLabel);

const closeRefusal = () => {
  refusalVisible.value = false;
  visible.value = false;
};
const closeConfirm = () => {
  confirmVisible.value = false;
  visible.value = false;
};
const returnRefusal = (content) => {
  refusalVisible.value = false;
  sendData.value.content = content;
  setTimeout(() => {
    confirmVisible.value = true;
  }, 300);
};
const returnConfirmPassword = (signature) => {
  confirmVisible.value = false;
  sendData.value.signature = signature.signature;
  setTimeout(() => {
    emits('return', sendData.value);
  }, 300);
};
const init = () => {
  sendData.value = {
    type: '',
    content: '',
  };
};

watch(visible, (val) => {
  if (val) {
    if (type.value === 'refusal') {
      refusalVisible.value = true;
      sendData.value.type = 'refusal';
    } else if (type.value === 'approval') {
      Modal.confirm({
        title: t('confirm.title.confirm'),
        content: t(confirmLabel.value),
        okText: t('common.button.ok'),
        cancelText: t('common.button.cancel'),
        onOk() {
          setTimeout(() => {
            sendData.value.type = 'approval';
            confirmVisible.value = true;
          }, 300);
        },
        onCancel() {
          closeConfirm();
        },
      });
    }
  } else if (!val) {
    setTimeout(() => {
      init();
    }, 300);
  }
});
</script>
