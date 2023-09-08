<template>
  <OtpRegistration :active="activeRegistration" @returnRegistration="returnRegistration" />
  <OtpCertification :active="activeCertification" :type="propType" @returnCertification="returnCertification" />
  <EmailVerification v-if="activeEmail" @returnEmail="returnEmail" @closeEmail="closeEmail()" />
</template>
<script setup>
import { ref, computed, watch, onBeforeUnmount, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'ant-design-vue';
import OtpRegistration from '@/components/partner/OtpRegistration.vue';
import OtpCertification from '@/components/partner/OtpCertification.vue';
import EmailVerification from '@/components/partner/EmailVerification.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const store = useStore();
const emits = defineEmits(['returnOtp', 'closeOtp']);
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});
const activeEmail = ref(false);
const otpIsRegister = computed(() => store.state['otp'].otpIsRegister);
const propType = computed(() => props.type);
const activeRegistration = ref(false);
const activeCertification = ref(false);

//store
const otpDelete = computed(() => store.state['otp'].OtpDelete);
//toggle
const toggleRegistration = () => {
  activeRegistration.value = !activeRegistration.value;
};
const toggleCertification = () => {
  activeCertification.value = !activeCertification.value;
};

//otpClose
const closeOtp = () => {
  activeRegistration.value = false;
  activeCertification.value = false;
  activeEmail.value = false;
  //ALL
  setTimeout(() => {
    emits('closeOtp');
  }, 300);
};

//return
const returnRegistration = (e) => {
  switch (e) {
    case 'close':
      closeOtp();
      break;

    case 'openCertification':
      toggleRegistration();
      toggleCertification();
      break;
  }
};
const returnCertification = (e) => {
  switch (e) {
    case 'close':
      closeOtp();
      break;

    case 'certification':
      closeOtp();
      emits('returnOtp');
      break;

    case 'registration':
      closeOtp();
      emits('returnOtp');
      break;
  }
};

//modal
const deleteOtpModal = async () => {
  Modal.confirm({
    title: () => t('modal.description.google_otp_removed'),
    class: 'otp-confirm-modal',
    closable: false,
    okText: () => t('common.button.ok'),
    cancelText: () => t('common.button.cancel'),
    async onOk() {
      await store.dispatch('otp/OtpDelete');
      if (otpDelete.value.returnData) {
        await store.dispatch('otp/OtpRegisterUri');
      }
      closeOtp();
    },
    onCancel() {
      closeOtp();
    },
    confirmLoading: true,
  });
};
const createOtpModal = () => {
  Modal.confirm({
    title: () => t('modal.description.google_otp_registration'),
    class: 'otp-confirm-modal',
    closable: false,
    okText: () => t('common.button.ok'),
    cancelText: () => t('common.button.cancel'),
    onOk() {
      toggleEmail();
    },
    onCancel() {
      closeOtp();
    },
  });
};

const toggleEmail = () => {
  activeEmail.value = !activeEmail.value;
};

const closeEmail = () => {
  activeEmail.value = !activeEmail.value;
};
const returnEmail = () => {
  toggleRegistration();
};

onBeforeMount(() => {
  if (otpIsRegister.value) {
    switch (propType.value) {
      case 'register':
        deleteOtpModal();
        break;

      case 'certificate':
        toggleCertification();
        break;
      case 'registerAndCertificate':
        toggleCertification();
        break;
    }
  } else {
    switch (propType.value) {
      case 'register':
        toggleRegistration();
        break;

      case 'registerAndCertificate':
        createOtpModal();
        break;
    }
  }
});
onBeforeUnmount(() => {
  activeRegistration.value = false;
  activeCertification.value = false;
  store.commit('otp/RESET_STATE');
});
</script>
