<template>
  <a-modal
    :visible="visible"
    :title="t('modal.title.google_otp')"
    class="confirm-pw-modal"
    :closable="false"
  >
    <fa-icon class="ico-lock" icon="fa-lock"></fa-icon>

    <strong>{{ t('modal.description.enter_verification_code') }}</strong>

    <a-form layout="vertical">
      <a-form-item :label="t('modal.description.google_authenticator_app')">
        <a-input
          class="otp-password"
          v-model:value="model.otp"
          :placeholder="t('modal.placeholder.otp_number')"
          v-on:keyup.enter="submit"
          :maxLength="6"
        />
      </a-form-item>
      <!-- <span class="feed">{{ feed }}</span> -->
    </a-form>

    <template #footer>
      <a-button key="close" @click="cancel">{{
        t('common.button.close')
      }}</a-button>

      <a-button
        key="confirm"
        type="primary"
        @click="submit"
        :loading="confirmLoading"
      >
        {{ t('common.button.confirm') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form } from 'ant-design-vue';
import { passwordRegex } from '@/utils/rules';
import { api } from '@/boot/axios';
import { VerificationMethod } from '@/utils/enums';

const { t } = useI18n();
const props = defineProps({
  visible: { type: Boolean, required: true },
});

const emits = defineEmits(['return']);

const confirmLoading = ref<boolean>(false);
const returnData = ref<any>(null);

const model = ref<any>({
  otp: '',
});

const visible = computed(() => props.visible);

const form = Form.useForm(model, {
  password: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: passwordRegex,
      message: () => t('form.rule.not_password_type'),
    },
  ],
});

const submit = async () => {
  if (confirmLoading.value) {
    return;
  }

  confirmLoading.value = true;

  try {
    await form.validate();

    const value = model.value.otp;
    const method = VerificationMethod.BackOfficeAuth;

    await api.auto.otp.verify({
      method: method,
      value: value,
    });
  } finally {
    confirmLoading.value = false;
  }

  emits('return', returnData.value);
};

const cancel = () => {
  returnData.value = null;
  form.resetFields();
};
</script>
