<template>
  <a-modal v-model:visible="visible" centered :forceRender="true" :destroyOnClose="true" :afterClose="afterClose">
    <template #closeIcon>
      <q-icon name="close" />
    </template>
    <template #title>
      <i class="cpass-logo"></i>
    </template>
    <template #footer>
      <q-btn unelevated color="primary" :label="$t('common.button.ok')" @click="handleOk" />
    </template>
    <div class="payment-area qr">
      <p class="description">{{ $t('modal.description.use_cpass') }}</p>
      <div class="cpass-qr-code"></div>
      <DownloadApp />
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import DownloadApp from 'src/components/DownloadApp.vue';
import { computed, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true,
  },
  prev: {
    type: Number,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('close', value, send.value);
  },
});

const emits = defineEmits(['close']);

const send = ref<number>(-1);

const onClose = () => {
  visible.value = false;
};

const handleOk = () => {
  send.value = props.prev;
  onClose();
};

const afterClose = () => {
  send.value = -1;
};
</script>
