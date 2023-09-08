<template>
  <a-modal
    class="otp-registration"
    :visible="propActive"
    :title="t('modal.title.google_otp_registration')"
    placement="left"
    :closable="false"
  >
    <ul class="otp-container">
      <li>{{ t('modal.description.enter_qr_key') }}</li>
      <li>
        <vue-qrcode
          :value="otpRegisterUri.returnData"
          :type="'image/webp'"
          :color="{ dark: '#000000ff', light: '#ffffffff' }"
          :key="otpRegisterUri"
        />
      </li>
      <li>
        <a-typography-paragraph copyable :content="parsedURI?.query.secret" />
      </li>
    </ul>
    <template #footer>
      <a-button @click="cancelBtn()">{{ t('common.button.cancel') }}</a-button>
      <a-button type="primary" @click="saveBtn()">{{ t('common.button.save') }}</a-button>
    </template>
  </a-modal>
</template>

<!-- -->
<script setup>
import VueQrcode from 'vue-qrcode';
import otpauthUriParser from 'otpauth-uri-parser';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { ref, watch, computed, onBeforeMount } from 'vue';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['returnRegistration']);
const props = defineProps({
  active: {
    type: Boolean,
    require: true,
  },
});
const otpRegisterUri = computed(() => store.state['otp'].otpRegisterUri);
const propActive = computed(() => props.active);
const parseURI = otpauthUriParser;
// const parseURI = require('otpauth-uri-parser');
const parsedURI = ref('');

const cancelBtn = () => {
  emits('returnRegistration', 'close');
};

const saveBtn = () => {
  emits('returnRegistration', 'openCertification');
};
onBeforeMount(() => {
  parsedURI.value = parseURI(otpRegisterUri.value.returnData);
});

watch(otpRegisterUri, () => {
  parsedURI.value = parseURI(otpRegisterUri.value.returnData);
});
</script>
