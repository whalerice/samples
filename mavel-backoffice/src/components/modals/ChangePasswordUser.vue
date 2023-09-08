<template>
  <a-modal
    v-model:visible="visible"
    :destroyOnClose="true"
    :forceRender="true"
    :confirmLoading="loading"
    :afterClose="afterClose"
    :okText="$t('common.button.confirm')"
    :cancelText="$t('common.button.cancel')"
    @ok="onConfirm"
    zIndex="1001"
    :title="$t('common.text.change_password')">
    <a-form layout="vertical">
      <a-form-item :label="$t('form.label.password')" v-bind="form.validateInfos.password">
        <a-input-password v-model:value="model.password" allowClear autocomplete="new-password" />
      </a-form-item>
      <a-form-item :label="$t('form.label.confirm_password')" v-bind="form.validateInfos.confirmPassword">
        <a-input-password v-model:value="model.confirmPassword" allowClear autocomplete="new-confirm-password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

import { passwordRegex } from 'src/boot/global';
import { apis } from 'src/stores/apis';

const { t } = useI18n();
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  idx: {
    type: Number,
    required: true,
  },
});

const visible = computed({
  get() {
    return props.show;
  },
  set(value) {
    emits('update:show', value);
  },
});

const emits = defineEmits(['update:show']);

const loading = ref<boolean>(false);

const model = ref<IUserChangePassword>({
  password: '',
  confirmPassword: '',
});

const validatePassword = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject(t('form.rule.empty'));
  } else if (!value.match(passwordRegex)) {
    return Promise.reject(t('form.rule.password'));
  } else if (value !== model.value.password) {
    return Promise.reject(t('form.rule.different_password'));
  }
  return Promise.resolve();
};

const form = Form.useForm(model, {
  password: [
    {
      required: true,
      message: () => t('form.rule.empty'),
    },
    {
      pattern: passwordRegex,
      message: () => t('form.rule.password'),
    },
  ],
  confirmPassword: [
    {
      required: true,
      validator: validatePassword,
    },
  ],
});

const onConfirm = async () => {
  loading.value = true;

  const send = {
    user_Idx: props.idx,
    password: model.value.password,
  };

  await form
    .validate()
    .then(async () => {
      const {
        data: { errCode: errCode, errMessage: errMessage },
      } = await apis.manager.UserChangePassword(send);

      loading.value = false;

      if (errCode === 0) {
        visible.value = false;
        message.success(errMessage);
      } else {
        message.error(errMessage);
      }
    })
    .catch(() => {
      loading.value = false;
    });
};

const afterClose = () => {
  form.resetFields();
};
</script>
