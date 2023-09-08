<template>
  <a-modal
    v-model:visible="isShow"
    :title="$t('confirm.title.refuse_partner')"
    @cancel="handleCancel"
    class="delete-partner-modal"
  >
    <a-textarea v-model:value="modalTextarea" :placeholder="$t('confirm.description.refuse_partner')" :rows="4" />
    <a-typography-text type="danger">{{ noReasonError }}</a-typography-text>
    <template #footer>
      <a-button @click="handleCancel">{{ $t('common.button.cancel') }}</a-button>
      <a-button type="primary" danger :loading="loading" @click="handleOk">{{ $t('common.button.delete') }}</a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
const store = useStore();

const { t: $t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['close']);

const isShow = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('close', val);
  },
});

const userInfo = computed({
  get() {
    return props.data;
  },
  set() {},
});

const loading = ref(false);
const modalTextarea = ref('');
const noReasonError = ref('');

const handleCancel = () => {
  modalTextarea.value = '';
  noReasonError.value = '';
  isShow.value = false;
};

const handleOk = async () => {
  if (modalTextarea.value === '') {
    noReasonError.value = $t('confirm.description.refuse_partner');
  } else {
    await store.dispatch('partner/partnerRefusal', { User_Sn: userInfo.value, Reasons: modalTextarea.value });
    modalTextarea.value = '';
    noReasonError.value = '';
    isShow.value = false;
  }
};
</script>
