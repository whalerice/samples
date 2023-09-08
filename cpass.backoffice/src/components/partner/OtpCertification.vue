<template>
  <a-modal :visible="propActive" :title="t('modal.title.google_otp')" class="confirm-pw-modal" :closable="false">
    <fa-icon class="ico-lock" icon="fa-lock"></fa-icon>
    <strong>{{ t('modal.description.enter_verification_code') }}</strong>
    <a-form layout="vertical">
      <a-form-item :label="t('modal.description.google_authenticator_app')">
        <a-input
          class="otp-password"
          v-model:value="otpNum"
          :placeholder="t('modal.placeholder.otp_number')"
          v-on:keyup.enter="confirmBtn()"
          :maxLength="6"
        />
      </a-form-item>
      <span class="feed">{{ feed }}</span>
    </a-form>
    <template #footer>
      <a-button key="close" @click="closeBtn()">{{ t('common.button.close') }}</a-button>
      <a-button key="confirm" type="primary" @click="confirmBtn()">{{ t('common.button.confirm') }}</a-button>
    </template>
  </a-modal>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['returnCertification']);
const props = defineProps({
  active: {
    type: Boolean,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
});
const propActive = computed(() => props.active);
const propType = computed(() => props.type);
const userId = computed(() => store.state['sign'].userInfo.user_Id);
const OtpVerify = computed(() => store.state['otp'].otpVerify);
const OtpRegister = computed(() => store.state['otp'].otpRegister);
const otpIsRegister = computed(() => store.state['otp'].otpIsRegister);
const otpNum = ref('');
const feed = ref('');
const closeBtn = () => {
  emits('returnCertification', 'close');
  otpNum.value = '';
};
const confirmBtn = async () => {
  const num = otpNum.value;
  switch (propType.value) {
    case 'certificate':
      await store.dispatch('otp/OtpVerify', {
        method: 10,
        type: 3,
        userId: userId.value,
        value: `${num}`,
      });
      if (OtpVerify.value.returnData !== null) {
        emits('returnCertification', 'certification');
        otpNum.value = '';
      } else {
        feed.value = t('component.error_msg.correct_number');
      }
      break;
    case 'register':
      await store.dispatch('otp/OtpRegister', {
        value: `${num}`,
      });
      if (OtpRegister.value.errCode === 0) {
        emits('returnCertification', 'registration');
        otpNum.value = '';
      } else {
        feed.value = t('component.error_msg.correct_number');
      }
      break;
    case 'registerAndCertificate':
      if (otpIsRegister.value) {
        await store.dispatch('otp/OtpVerify', {
          method: 10,
          type: 3,
          userId: userId.value,
          value: `${num}`,
        });
        if (OtpVerify.value.returnData !== null) {
          emits('returnCertification', 'certification');
          otpNum.value = '';
        } else {
          feed.value = t('component.error_msg.correct_number');
        }
        break;
      } else {
        await store.dispatch('otp/OtpRegister', {
          value: `${num}`,
        });

        if (OtpRegister.value.errCode === 0) {
          await store.dispatch('otp/OtpVerify', {
            method: 10,
            type: 3,
            userId: userId.value,
            value: `${num}`,
          });
          if (OtpVerify.value.returnData !== null) {
            emits('returnCertification', 'certification');
            otpNum.value = '';
          }
        } else {
          feed.value = t('component.error_msg.correct_number');
        }
        break;
      }
  }
};

watch(otpNum, () => {
  otpNum.value = otpNum.value.replace(/[^0-9]+$/, '');
});
</script>
